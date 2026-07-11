"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlanIds } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

/**
 * Persist the guest cookie plan onto the freshly signed-in user's account so
 * nothing is lost on the guest -> account transition.
 */
async function persistGuestPlan(supabase: SupabaseClient, userId: string): Promise<void> {
  const ids = await getPlanIds();

  const { data: plan, error } = await supabase
    .from("plans")
    .upsert(
      { user_id: userId, spec: {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();
  if (error || !plan) {
    return;
  }

  await supabase.from("plan_products").delete().eq("plan_id", plan.id);
  if (ids.length) {
    await supabase
      .from("plan_products")
      .insert(ids.map((product_id) => ({ plan_id: plan.id, product_id })));
  }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  await persistGuestPlan(supabase, data.user.id);
  redirect("/plan");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }
  if (password !== confirmation) {
    return { error: "รหัสผ่านยืนยันไม่ตรงกัน" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: "สมัครไม่สำเร็จ — อีเมลนี้อาจถูกใช้แล้ว" };
  }

  if (data.user && data.session) {
    await persistGuestPlan(supabase, data.user.id);
    redirect("/plan");
  }

  redirect("/login");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
