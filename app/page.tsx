import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

async function getResumen() {
  const { data: snapshots } = await supabaseAdmin
    .from("portfolio_snapshots")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(1);

  const { count: numOperaciones } = await supabaseAdmin
    .from("operaciones")
    .select("*", { count: "exact", head: true });

  return {
    ultimoSnapshot: snapshots?.[0] ?? null,
    numOperaciones: numOperaciones ?? 0,
  };
}

function Cifra({
  etiqueta,
  valor,
  tono = "ink",
}: {
  etiqueta: string;
  valor: string;
  tono?: "ink" | "profit" | "loss" | "alert";
}) {
  const colores: Record<string, string> = {
    ink: "text-ink",
    profit: "text-profit",
    loss: "text-loss",
    alert: "text-alert",
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{etiqueta}</span>
      <span className={`font-mono text-2xl font-medium ${colores[tono]}`}>{valor}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const { ultimoSnapshot, numOperaciones } = await getResumen();
  const sinDatos = numOperaciones === 0;

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-8 py-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Oficina patrimonial</p>
          <h1 className="font-display text-2xl font-medium">Cartera</h1>
        </div>
        <div className="w-px h-10 bg-border" />
        <nav className="flex gap-4 text-sm">
          <Link href="/activos" className="text-muted hover:text-ink">
            Activos
          </Link>
          <Link href="/operaciones" className="text-muted hover:text-ink">
            Operaciones
          </Link>
        </nav>
        <div className="flex-1" />
        <p className="text-xs text-muted font-mono">Europe/Paris · EUR</p>
      </header>

      <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <section className="space-y-8">
          {sinDatos ? (
            <div className="border border-dashed border-border rounded-lg p-10 text-center">
              <p className="font-display text-lg mb-2">Todavía no hay movimientos</p>
              <p className="text-muted text-sm max-w-md mx-auto">
                En cuanto registres tu primera operación (compra, DCA o transferencia),
                el snapshot diario empezará a construir el histórico desde hoy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-surface border border-border rounded-lg p-6">
              <Cifra etiqueta="Patrimonio total" valor={`€${ultimoSnapshot?.valor_total_cartera ?? 0}`} />
              <Cifra etiqueta="Capital aportado" valor={`€${ultimoSnapshot?.capital_aportado_acumulado ?? 0}`} />
              <Cifra
                etiqueta="Profit total"
                valor={`€${ultimoSnapshot?.pnl_total ?? 0}`}
                tono={(ultimoSnapshot?.pnl_total ?? 0) >= 0 ? "profit" : "loss"}
              />
              <Cifra etiqueta="Fiat disponible" valor={`€${ultimoSnapshot?.fiat_disponible ?? 0}`} />
            </div>
          )}

          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
              Histórico de cartera
            </h2>
            <div className="h-48 flex items-center justify-center text-muted text-sm border border-dashed border-border rounded">
              El gráfico aparecerá aquí en cuanto existan snapshots diarios.
            </div>
          </div>
        </section>

        <aside className="bg-surfacealt border border-border rounded-lg p-6 h-fit space-y-4">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted">Decisión hoy</h2>
          <div className="border-l-2 border-accent pl-4">
            <p className="text-sm text-ink">
              {sinDatos
                ? "Sin cartera activa todavía. Registra tu primera operación para empezar."
                : "Seguir DCA normal."}
            </p>
          </div>
          <p className="text-xs text-muted">
            Ninguna recomendación aquí ejecuta operaciones. Son señales explicables para tu propia decisión.
          </p>
        </aside>
      </div>
    </main>
  );
}
