import { supabaseAdmin } from "@/lib/supabase";
import { fetchPreciosCoingecko, fetchPrecioYahoo } from "@/lib/precios";

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
  let ultimoPrecioOperacion = 0;

  for (const op of operaciones ?? []) {
    const precio = op.precio_unitario ?? 1;
    const cant = Number(op.cantidad);
    const comision = Number(op.comision ?? 0);

    if (TIPOS_ENTRADA.includes(op.tipo)) {
      cantidad += cant;
      costeTotal += cant * precio + comision;
      ultimoPrecioOperacion = precio;
    } else if (TIPOS_SALIDA.includes(op.tipo)) {
      const precioMedioActual = cantidad > 0 ? costeTotal / cantidad : 0;
      const costeVendido = precioMedioActual * cant;
      const valorVenta = cant * precio - comision;
      pnlRealizado += valorVenta - costeVendido;
      cantidad -= cant;
      costeTotal -= costeVendido;
      ultimoPrecioOperacion = precio;
    }
  }

  const precioMedioCompra = cantidad > 0 ? costeTotal / cantidad : 0;

  const { data: estadoExistente } = await supabaseAdmin
    .from("activos_estado_actual")
    .select("precio_actual")
    .eq("activo_id", activoId)
    .maybeSingle();

  const precioActual = estadoExistente?.precio_actual || ultimoPrecioOperacion || 0;
  const valorActual = cantidad * precioActual;
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

export async function actualizarPrecioMercado(activoId: string, nuevoPrecio: number) {
  const { data: estado } = await supabaseAdmin
    .from("activos_estado_actual")
    .select("cantidad_total, coste_total")
    .eq("activo_id", activoId)
    .maybeSingle();

  if (!estado) return;

  const cantidad = Number(estado.cantidad_total ?? 0);
  const costeTotal = Number(estado.coste_total ?? 0);
  const valorActual = cantidad * nuevoPrecio;
  const pnlNoRealizado = valorActual - costeTotal;

  await supabaseAdmin
    .from("activos_estado_actual")
    .update({
      precio_actual: nuevoPrecio,
      valor_actual: valorActual,
      pnl_no_realizado: pnlNoRealizado,
      actualizado_en: new Date().toISOString(),
    })
    .eq("activo_id", activoId);
}

export async function refrescarTodosPrecios() {
  const { data: activos } = await supabaseAdmin
    .from("activos")
    .select("id, ticker, categoria, coingecko_id")
    .is("deleted_at", null);

  if (!activos) return { actualizados: 0, fallidos: 0 };

  let actualizados = 0;
  let fallidos = 0;

  const cryptoConId = activos.filter((a) => a.categoria === "crypto" && a.coingecko_id);
  const idsUnicos = [...new Set(cryptoConId.map((a) => a.coingecko_id as string))];
  const preciosCrypto = await fetchPreciosCoingecko(idsUnicos);

  for (const activo of cryptoConId) {
    const precio = preciosCrypto[activo.coingecko_id as string];
    if (precio) {
      await actualizarPrecioMercado(activo.id, precio);
      actualizados++;
    } else {
      fallidos++;
    }
  }

  const accionesEtf = activos.filter((a) => a.categoria === "accion" || a.categoria === "etf");
  for (const activo of accionesEtf) {
    const precio = await fetchPrecioYahoo(activo.ticker);
    if (precio) {
      await actualizarPrecioMercado(activo.id, precio);
      actualizados++;
    } else {
      fallidos++;
    }
  }

  const fiats = activos.filter((a) => a.categoria === "fiat");
  for (const activo of fiats) {
    await actualizarPrecioMercado(activo.id, 1);
    actualizados++;
  }

  const stablecoinsSinId = activos.filter(
    (a) => a.categoria === "stablecoin" && !a.coingecko_id
  );
  for (const activo of stablecoinsSinId) {
    await actualizarPrecioMercado(activo.id, 1);
    actualizados++;
  }

  await recalcularSnapshotDelDia();

  return { actualizados, fallidos };
}

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
    .select("cantidad, precio_unitario")
    .eq("tipo", "transferencia_fiat")
    .is("deleted_at", null);

  const capitalAportadoAcumulado = (aportes ?? []).reduce(
    (acc, o) => acc + Number(o.cantidad ?? 0) * Number(o.precio_unitario ?? 1),
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
