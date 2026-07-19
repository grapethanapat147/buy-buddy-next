import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client that bypasses RLS. SERVER-ONLY — never import from a
 * client component. Used exclusively inside admin server actions that have already
 * verified the caller is an admin (see requireAdmin).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — admin writes are disabled.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
