import { supabaseAdmin } from "@/lib/supabase";

const TIPOS_ENTRADA = [
  "compra",
  "dca",
  "recompra",
  "transferencia_fiat",
  "conversion_fiat_stable",
  "staking",
  "dividendo",
  "interes",
];

const TIPOS_SALIDA = ["venta", "venta_parcial"];

/**
 * Recalcula cantidad, coste medio, valor y profit de un activo
 * a partir de TODAS sus operaciones, usando precio medio ponderado.
 */
export async function recalcularActivo(activoId: string) {
  const { data: operaciones } = await supabaseAdmin
    .from("operaciones")
    .select("*")
    .eq("activo_id", activoId)
    .is("deleted_at", null)
    .order("fecha_hora", { ascending: true });

  let cantidad = 0;
  let costeTotal = 0;
  let pnlRealizado = 0;
  let ultimoPrecio = 0;

  for (const op of operaciones ?? []) {
    const precio = op.precio_unitario ?? 1;
    const cant = Number(op.cantidad);
    const comision = Number(op.comision ?? 0);

    if (TIPOS_ENTRADA.includes(op.tipo)) {
      cantidad += cant;
      costeTotal += cant * precio + comision;
      ultimoPrecio = precio;
    } else if (TIPOS_SALIDA.includes(op.tipo)) {
      const precioMedioActual = cantidad > 0 ? costeTotal / cantidad : 0;
      const costeVendido = precioMedioActual * cant;
      const valorVenta = cant * precio - comision;
      pnlRealizado += valorVenta - costeVendido;
      cantidad -= cant;
      costeTotal -= costeVendido;
      ultimoPrecio = precio;
    }
  }

  const precioActual = ultimoPrecio || 0;
  const valorActual = cantidad * precioActual;
  const precioMedioCompra = cantidad > 0 ? costeTotal / cantidad : 0;
  const pnlNoRealizado = valorActual - costeTotal;

  await supabaseAdmin.from("activos_estado_actual").upsert({
    activo_id: activoId,
    precio_actual: precioActual,
    precio_medio_compra: precioMedioCompra,
    cantidad_total: cantidad,
    coste_total: costeTotal,
    valor_actual: valorActual,
    pnl_no_realizado: pnlNoRealizado,
    pnl_realizado_acumulado: pnlRealizado,
    actualizado_en: new Date().toISOString(),
  });
}

/**
 * Recalcula el snapshot del día de hoy sumando todos los activos.
 */
export async function recalcularSnapshotDelDia() {
  const { data: estados } = await supabaseAdmin
    .from("activos_estado_actual")
    .select("*, activos(categoria)");

  let valorTotalCartera = 0;
  let fiatDisponible = 0;
  let stablecoinsDisponibles = 0;
  let pnlNoRealizado = 0;
  let pnlRealizadoAcumulado = 0;

  for (const e of estados ?? []) {
    const valor = Number(e.valor_actual ?? 0);
    valorTotalCartera += valor;
    pnlNoRealizado += Number(e.pnl_no_realizado ?? 0);
    pnlRealizadoAcumulado += Number(e.pnl_realizado_acumulado ?? 0);

    const categoria = (e as any).activos?.categoria;
    if (categoria === "fiat") fiatDisponible += valor;
    if (categoria === "stablecoin") stablecoinsDisponibles += valor;
  }

  const valorInvertido = valorTotalCartera - fiatDisponible - stablecoinsDisponibles;

  const { data: aportes } = await supabaseAdmin
    .from("operaciones")
    .select("valor_bruto")
    .eq("tipo", "transferencia_fiat")
    .is("deleted_at", null);

  const capitalAportadoAcumulado = (aportes ?? []).reduce(
    (acc, o) => acc + Number(o.valor_bruto ?? 0),
    0
  );

  const { data: comisiones } = await supabaseAdmin
    .from("operaciones")
    .select("comision")
    .is("deleted_at", null);

  const comisionesAcumuladas = (comisiones ?? []).reduce(
    (acc, o) => acc + Number(o.comision ?? 0),
    0
  );

  const pnlTotal = pnlNoRealizado + pnlRealizadoAcumulado;
  const rentabilidadPct =
    capitalAportadoAcumulado > 0 ? (pnlTotal / capitalAportadoAcumulado) * 100 : 0;

  const hoy = new Date().toISOString().split("T")[0];

  await supabaseAdmin.from("portfolio_snapshots").upsert(
    {
      fecha: hoy,
      capital_aportado_acumulado: capitalAportadoAcumulado,
      valor_total_cartera: valorTotalCartera,
      valor_invertido: valorInvertido,
      fiat_disponible: fiatDisponible,
      stablecoins_disponibles: stablecoinsDisponibles,
      pnl_realizado_acumulado: pnlRealizadoAcumulado,
      pnl_no_realizado: pnlNoRealizado,
      pnl_total: pnlTotal,
      rentabilidad_pct: rentabilidadPct,
      comisiones_acumuladas: comisionesAcumuladas,
      generado_automaticamente: false,
    },
    { onConflict: "fecha" }
  );
}
