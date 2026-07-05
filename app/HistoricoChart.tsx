"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type PuntoHistorico = {
  fecha: string;
  valor_total_cartera: number;
  capital_aportado_acumulado: number;
  fiat_disponible: number;
};

export default function HistoricoChart({ datos }: { datos: PuntoHistorico[] }) {
  if (datos.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted text-sm border border-dashed border-border rounded">
        El gráfico aparecerá aquí en cuanto existan snapshots diarios.
      </div>
    );
  }

  const datosFormateados = datos.map((d) => ({
    ...d,
    fechaCorta: new Date(d.fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datosFormateados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#232A32" vertical={false} />
          <XAxis
            dataKey="fechaCorta"
            stroke="#8B94A1"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#232A32" }}
          />
          <YAxis
            stroke="#8B94A1"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#171C22",
              border: "1px solid #232A32",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#8B94A1" }}
            formatter={(value: number, name: string) => {
              const etiquetas: Record<string, string> = {
                valor_total_cartera: "Patrimonio total",
                capital_aportado_acumulado: "Capital aportado",
                fiat_disponible: "Fiat disponible",
              };
              return [`€${value}`, etiquetas[name] ?? name];
            }}
          />
          <Line
            type="monotone"
            dataKey="valor_total_cartera"
            stroke="#5C9285"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="capital_aportado_acumulado"
            stroke="#8B94A1"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-accentlight inline-block" /> Patrimonio total
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-muted inline-block" style={{ borderTop: "1px dashed" }} />{" "}
          Capital aportado
        </span>
      </div>
    </div>
  );
}
