import { supabaseAdmin } from "@/lib/supabase";
import { crearActivo } from "@/lib/actions";
import Link from "next/link";

async function getActivos() {
  const { data } = await supabaseAdmin
    .from("activos")
    .select("id, nombre, ticker, categoria, moneda_principal, peso_objetivo")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function ActivosPage() {
  const activos = await getActivos();

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-8 py-6 flex items-center gap-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← Cartera
        </Link>
        <h1 className="font-display text-2xl font-medium">Activos</h1>
      </header>

      <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <section className="bg-surface border border-border rounded-lg p-6 h-fit">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
            Nuevo activo
          </h2>
          <form action={crearActivo} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1">Nombre</label>
              <input
                name="nombre"
                required
                placeholder="Bitcoin"
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Ticker</label>
              <input
                name="ticker"
                required
                placeholder="BTC"
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Categoría</label>
              <select
                name="categoria"
                required
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              >
                <option value="crypto">Crypto</option>
                <option value="accion">Acción</option>
                <option value="etf">ETF</option>
                <option value="oro">Oro</option>
                <option value="fiat">Fiat</option>
                <option value="stablecoin">Stablecoin</option>
                <option value="fondo">Fondo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Moneda principal</label>
              <input
                name="moneda_principal"
                defaultValue="EUR"
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Peso objetivo (%)</label>
              <input
                name="peso_objetivo"
                type="number"
                step="0.01"
                placeholder="20"
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Tesis de inversión</label>
              <textarea
                name="tesis"
                rows={3}
                placeholder="¿Por qué tienes este activo?"
                className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accentlight text-white rounded px-4 py-2 text-sm font-medium transition-colors"
            >
              Crear activo
            </button>
          </form>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
            Activos existentes
          </h2>
          {activos.length === 0 ? (
            <p className="text-muted text-sm">Todavía no has creado ningún activo.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted text-xs uppercase border-b border-border">
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Ticker</th>
                  <th className="pb-2">Categoría</th>
                  <th className="pb-2">Moneda</th>
                  <th className="pb-2 text-right">Peso objetivo</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {activos.map((a) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-2">{a.nombre}</td>
                    <td className="py-2">{a.ticker}</td>
                    <td className="py-2">{a.categoria}</td>
                    <td className="py-2">{a.moneda_principal}</td>
                    <td className="py-2 text-right">
                      {a.peso_objetivo ? `${a.peso_objetivo}%` : "—"}
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
