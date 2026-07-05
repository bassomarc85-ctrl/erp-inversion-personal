"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recalcularActivo, recalcularSnapshotDelDia } from "@/lib/calculos";

export async function crearActivo(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const ticker = formData.get("ticker") as string;
  const categoria = formData.get("categoria") as string;
  const moneda_principal = (formData.get("moneda_principal") as string) || "EUR";
  const peso_objetivo = formData.get("peso_objetivo")
    ? Number(formData.get("peso_objetivo"))
    : null;
  const tesis = (formData.get("tesis") as string) || null;

  const { error } = await supabaseAdmin.from("activos").insert({
    nombre,
    ticker,
    categoria,
    moneda_principal,
    peso_objetivo,
    tesis,
    fuente_precio: categoria === "crypto" ? "coingecko" : "manual",
  });

  if (error) {
    throw new Error(`No se pudo crear el activo: ${error.message}`);
  }

  revalidatePath("/activos");
  revalidatePath("/");
}

export async function crearOperacion(formData: FormData) {
  const activo_id = formData.get("activo_id") as string;
  const tipo = formData.get("tipo") as string;
  const fecha_hora = formData.get("fecha_hora") as string;
  const cantidad = Number(formData.get("cantidad"));
  const precio_unitario = formData.get("precio_unitario")
    ? Number(formData.get("precio_unitario"))
    : null;
  const comision = formData.get("comision") ? Number(formData.get("comision")) : 0;
  const moneda = (formData.get("moneda") as string) || "EUR";
  const etiqueta_estrategica = (formData.get("etiqueta_estrategica") as string) || null;
  const plataformaNombre = (formData.get("plataforma") as string) || null;
  const notas = (formData.get("notas") as string) || null;

  let plataforma_id: string | null = null;

  if (plataformaNombre) {
    const { data: existente } = await supabaseAdmin
      .from("plataformas_custodia")
      .select("id")
      .eq("nombre", plataformaNombre)
      .maybeSingle();

    if (existente) {
      plataforma_id = existente.id;
    } else {
      const { data: nueva, error: errorPlataforma } = await supabaseAdmin
        .from("plataformas_custodia")
        .insert({ nombre: plataformaNombre, tipo: "otro" })
        .select("id")
        .single();
      if (errorPlataforma) {
        throw new Error(`No se pudo crear la plataforma: ${errorPlataforma.message}`);
      }
      plataforma_id = nueva.id;
    }
  }

  const valor_bruto = precio_unitario ? cantidad * precio_unitario : null;
  const valor_neto = valor_bruto !== null ? valor_bruto - comision : null;

  const { error } = await supabaseAdmin.from("operaciones").insert({
    activo_id,
    tipo,
    fecha_hora: new Date(fecha_hora).toISOString(),
    cantidad,
    precio_unitario,
    comision,
    valor_bruto,
    valor_neto,
    moneda,
    etiqueta_estrategica,
    plataforma_id,
    notas,
    estado_validacion: "pendiente",
  });

  if (error) {
    throw new Error(`No se pudo crear la operación: ${error.message}`);
  }

  await recalcularActivo(activo_id);
  await recalcularSnapshotDelDia();

  revalidatePath("/operaciones");
  revalidatePath("/");
}

export async function eliminarOperacion(formData: FormData) {
  const id = formData.get("id") as string;
  const activo_id = formData.get("activo_id") as string;

  const { error } = await supabaseAdmin
    .from("operaciones")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar la operación: ${error.message}`);
  }

  await recalcularActivo(activo_id);
  await recalcularSnapshotDelDia();

  revalidatePath("/operaciones");
  revalidatePath("/");
}
