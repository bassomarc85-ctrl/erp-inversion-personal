import { createClient } from "@supabase/supabase-js";

// Cliente para uso en el navegador (solo lectura, respeta RLS con la anon key)
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente para uso EXCLUSIVO en servidor (jobs, snapshot diario, webhooks).
// Nunca importar este archivo desde un componente de cliente ("use client").
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
