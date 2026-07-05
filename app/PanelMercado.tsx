import { PrecioMercado } from "@/lib/mercado";

export default function PanelMercado({ precios }: { precios: PrecioMercado[] }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display text-sm uppercase tracking-wide text-muted mb-4">
        Mercado de referencia
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {precios.map((p) => (
          <div key={p.ticker} className="flex flex-col gap-1">
            <span className="text-xs text-muted">{p.nombre}</span>
            <span className="font-mono text-sm">
              {p.precio !== null
                ? `${p.moneda === "EUR" ? "€" : "$"}${p.precio.toLocaleString("es-ES", {
                    maximumFractionDigits: 2,
                  })}`
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
