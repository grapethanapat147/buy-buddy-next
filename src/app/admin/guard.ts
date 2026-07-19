import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

/** True when the current request is from a signed-in admin (email on the allowlist). */
export async function currentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email, process.env.ADMIN_EMAILS);
}

/** Guard for admin pages/actions: redirect non-admins to login instead of exposing anything. */
export async function requireAdmin(): Promise<void> {
  if (!(await currentUserIsAdmin())) {
    redirect("/login");
  }
}
