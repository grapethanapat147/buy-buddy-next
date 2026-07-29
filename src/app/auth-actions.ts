"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mergePlanIds } from "@/lib/plan";
import { getPlanIds, getSpec, setPlanIds, setSpec } from "@/lib/session";
import { normalizeSpec, type Spec } from "@/lib/recommendation/types";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

/**
 * Reconcile the guest cookie plan with whatever is already saved on the account,
 * in BOTH directions, so nothing is lost on the guest <-> account transition:
 *   - the account keeps the UNION of its saved items and the guest's items
 *     (logging in from a fresh device must never wipe the saved plan), and
 *   - the cookie is refreshed to that union (+ saved spec) so this session shows
 *     everything the account has.
 */
export async function reconcilePlanWithAccount(supabase: SupabaseClient, userId: string): Promise<void> {
  const guestIds = await getPlanIds();
  const guestSpec = await getSpec();

  const { data: existing } = await supabase
    .from("plans")
    .select("id, spec, plan_products(product_id)")
    .eq("user_id", userId)
    .maybeSingle();

  const savedIds: number[] = (existing?.plan_products ?? []).map(
    (r: { product_id: number }) => r.product_id,
  );
  const merged = mergePlanIds(savedIds, guestIds);

  // Prefer a spec the guest just filled in; otherwise keep whatever was saved.
  const savedSpec =
    existing?.spec && Object.keys(existing.spec).length > 0
      ? normalizeSpec(existing.spec as Partial<Spec>)
      : null;
  const specToSave = guestSpec ?? savedSpec;

  const { data: plan, error } = await supabase
    .from("plans")
    .upsert(
      { user_id: userId, spec: specToSave ?? {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();
  if (error || !plan) {
    return;
  }

  await supabase.from("plan_products").delete().eq("plan_id", plan.id);
  if (merged.length) {
    await supabase
      .from("plan_products")
      .insert(merged.map((product_id) => ({ plan_id: plan.id, product_id })));
  }

  // Hydrate this session's cookie from the reconciled account state.
  await setPlanIds(merged);
  if (guestSpec == null && savedSpec) {
    await setSpec(savedSpec);
  }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const notConfirmed =
      error?.code === "email_not_confirmed" || /confirm/i.test(error?.message ?? "");
    return {
      error: notConfirmed
        ? "อีเมลนี้ยังไม่ได้ยืนยัน — กดลิงก์ยืนยันในอีเมล หรือให้แอดมินปิดการยืนยันอีเมลใน Supabase"
        : "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }

  await reconcilePlanWithAccount(supabase, data.user.id);
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
    await reconcilePlanWithAccount(supabase, data.user.id);
    redirect("/plan");
  }

  redirect("/login");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
