import { supabaseAdmin } from "@/lib/supabase";
import { crearOperacion, eliminarOperacion } from "@/lib/actions";
import Link from "next/link";

async function getDatos() {
  const { data: activos } = await supabaseAdmin
    .from("activos")
    .select("id, nombre, ticker")
    .is("deleted_at", null)
    .order("nombre");

  const { data: operaciones } = await supabaseAdmin
    .from("operaciones")
    .select("id, activo_id, fecha_hora, tipo, cantidad, precio_unitario, moneda, activos(nombre, ticker)")
    .is("deleted_at", null)
    .order("fecha_hora", { ascending: false })
    .limit(20);

  return { activos: activos ?? [], operaciones: operaciones ?? [] };
}

export default async function OperacionesPage() {
  const { activos, operaciones } = await getDatos();

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-8 py-6 flex items-center gap-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← Cartera
        </Link>
        <h1 className="font-display text-2xl font-medium">Operaciones</h1>
      </header>

      <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <section className="bg-surface border border-border rounded-lg p-6 h-fit">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
            Nueva operación
          </h2>

          {activos.length === 0 ? (
            <p className="text-muted text-sm">
              Primero crea al menos un activo en{" "}
              <Link href="/activos" className="text-accentlight underline">
                la página de Activos
              </Link>
              .
            </p>
          ) : (
            <form action={crearOperacion} className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Activo</label>
                <select
                  name="activo_id"
                  required
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                >
                  {activos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.ticker})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Tipo de operación</label>
                <select
                  name="tipo"
                  required
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                >
                  <option value="compra">Compra</option>
                  <option value="venta">Venta</option>
                  <option value="venta_parcial">Venta parcial</option>
                  <option value="recompra">Recompra</option>
                  <option value="dca">DCA</option>
                  <option value="transferencia_fiat">Transferencia fiat</option>
                  <option value="conversion_fiat_stable">Conversión fiat → stable</option>
                  <option value="staking">Staking</option>
                  <option value="dividendo">Dividendo</option>
                  <option value="interes">Interés</option>
                  <option value="ajuste_manual">Ajuste manual</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Fecha y hora</label>
                <input
                  name="fecha_hora"
                  type="datetime-local"
                  required
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1">Cantidad</label>
                  <input
                    name="cantidad"
                    type="number"
                    step="0.00000001"
                    required
                    className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Precio unitario</label>
                  <input
                    name="precio_unitario"
                    type="number"
                    step="0.01"
                    className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1">Comisión</label>
                  <input
                    name="comision"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Moneda</label>
                  <input
                    name="moneda"
                    defaultValue="EUR"
                    className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Plataforma (opcional)</label>
                <input
                  name="plataforma"
                  placeholder="Binance, Kraken, banco..."
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Etiqueta estratégica</label>
                <select
                  name="etiqueta_estrategica"
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                >
                  <option value="">— Sin etiqueta —</option>
                  <option value="dca">DCA</option>
                  <option value="compra_tactica">Compra táctica</option>
                  <option value="recompra">Recompra</option>
                  <option value="toma_beneficios">Toma de beneficios</option>
                  <option value="rebalanceo">Rebalanceo</option>
                  <option value="staking">Staking</option>
                  <option value="dividendo">Dividendo</option>
                  <option value="otra">Otra</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Notas</label>
                <textarea
                  name="notas"
                  rows={2}
                  className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accentlight text-white rounded px-4 py-2 text-sm font-medium transition-colors"
              >
                Registrar operación
              </button>
            </form>
          )}
        </section>

        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
            Últimas operaciones
          </h2>
          {operaciones.length === 0 ? (
            <p className="text-muted text-sm">Todavía no hay operaciones registradas.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted text-xs uppercase border-b border-border">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Activo</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2 text-right">Cantidad</th>
                  <th className="pb-2 text-right">Precio</th>
                  <th className="pb-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {operaciones.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="py-2">
                      {new Date(o.fecha_hora).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-2">{o.activos?.ticker ?? "—"}</td>
                    <td className="py-2">{o.tipo}</td>
                    <td className="py-2 text-right">{o.cantidad}</td>
                    <td className="py-2 text-right">
                      {o.precio_unitario ? `${o.moneda} ${o.precio_unitario}` : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <form action={eliminarOperacion}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="activo_id" value={o.activo_id} />
                        <button
                          type="submit"
                          className="text-xs text-muted hover:text-loss"
                        >
                          Borrar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
