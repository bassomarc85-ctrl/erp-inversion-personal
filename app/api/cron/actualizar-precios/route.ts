import { refrescarTodosPrecios } from "@/lib/calculos";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const resultado = await refrescarTodosPrecios();
  return NextResponse.json(resultado);
}
