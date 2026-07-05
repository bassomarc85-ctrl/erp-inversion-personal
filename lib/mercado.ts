import { fetchPreciosCoingecko, fetchPrecioYahoo } from "@/lib/precios";

type ReferenciaMercado = {
  nombre: string;
  ticker: string;
  tipo: "coingecko" | "yahoo";
  idFuente: string;
  moneda: "EUR" | "USD";
};

const REFERENCIAS: ReferenciaMercado[] = [
  { nombre: "Bitcoin", ticker: "BTC", tipo: "coingecko", idFuente: "bitcoin", moneda: "EUR" },
  { nombre: "Ethereum", ticker: "ETH", tipo: "coingecko", idFuente: "ethereum", moneda: "EUR" },
  { nombre: "S&P 500", ticker: "SPX", tipo: "yahoo", idFuente: "^GSPC", moneda: "USD" },
  { nombre: "Oro", ticker: "XAU", tipo: "yahoo", idFuente: "GC=F", moneda: "USD" },
  { nombre: "Apple", ticker: "AAPL", tipo: "yahoo", idFuente: "AAPL", moneda: "USD" },
  { nombre: "Tesla", ticker: "TSLA", tipo: "yahoo", idFuente: "TSLA", moneda: "USD" },
  { nombre: "Nvidia", ticker: "NVDA", tipo: "yahoo", idFuente: "NVDA", moneda: "USD" },
];

export type PrecioMercado = {
  nombre: string;
  ticker: string;
  precio: number | null;
  moneda: string;
};

export async function getPreciosMercado(): Promise<PrecioMercado[]> {
  const idsCoingecko = REFERENCIAS.filter((r) => r.tipo === "coingecko").map(
    (r) => r.idFuente
  );
  const preciosCrypto = await fetchPreciosCoingecko(idsCoingecko);

  const resultados: PrecioMercado[] = [];

  for (const ref of REFERENCIAS) {
    if (ref.tipo === "coingecko") {
      resultados.push({
        nombre: ref.nombre,
        ticker: ref.ticker,
        precio: preciosCrypto[ref.idFuente] ?? null,
        moneda: ref.moneda,
      });
    } else {
      const precio = await fetchPrecioYahoo(ref.idFuente);
      resultados.push({
        nombre: ref.nombre,
        ticker: ref.ticker,
        precio,
        moneda: ref.moneda,
      });
    }
  }

  return resultados;
}
