"use server";

import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Credenciales incorrectas")}`);
  }

  redirect("/");
}

export async function logout() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
