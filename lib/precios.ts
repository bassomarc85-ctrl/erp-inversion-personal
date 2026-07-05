export async function fetchPreciosCoingecko(
  coingeckoIds: string[]
): Promise<Record<string, number>> {
  if (coingeckoIds.length === 0) return {};

  const ids = coingeckoIds.join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return {};
    const data = await res.json();

    const resultado: Record<string, number> = {};
    for (const id of coingeckoIds) {
      if (data[id]?.eur) {
        resultado[id] = data[id].eur;
      }
    }
    return resultado;
  } catch {
    return {};
  }
}

export async function fetchPrecioYahoo(ticker: string): Promise<number | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const precio = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return typeof precio === "number" ? precio : null;
  } catch {
    return null;
  }
}
