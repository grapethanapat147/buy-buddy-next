"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getPlanIds,
  getRestockSchedule,
  setPlanIds,
  setRestockSchedule,
  setSpec,
} from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Spec } from "@/lib/recommendation/types";

function revalidatePlanPages() {
  revalidatePath("/recommendations");
  revalidatePath("/plan");
  revalidatePath("/explore");
}

/** Persist a Spec object (used by the wizard form action and the AI planner). */
export async function saveSpec(spec: Spec, redirectTo = "/recommendations") {
  await setSpec(spec);
  revalidatePlanPages();
  redirect(redirectTo);
}

export async function saveSpecForm(formData: FormData) {
  const spec: Spec = {
    budget: Number(formData.get("budget")) || 5000,
    roomType: String(formData.get("room_type") ?? "studio"),
    occupants: Number(formData.get("occupants")) || 1,
    cooking: String(formData.get("cooking") ?? "sometimes"),
    laundry: String(formData.get("laundry") ?? "own_machine"),
    workStyle: String(formData.get("work_style") ?? "office"),
    spendingStyle: String(formData.get("spending_style") ?? "balanced"),
    ownedProductIds: [],
  };
  await saveSpec(spec);
}

export async function addToPlan(productId: number) {
  const ids = await getPlanIds();
  await setPlanIds([...ids, productId]);
  revalidatePlanPages();
}

export async function removeFromPlan(productId: number) {
  const ids = await getPlanIds();
  await setPlanIds(ids.filter((id) => id !== productId));
  revalidatePlanPages();
}

/** Assign a restock item to a day of the month (1–31) on the buy calendar. */
export async function setRestockDay(productId: number, day: number) {
  const clamped = Math.min(31, Math.max(1, Math.round(day)));
  const schedule = await getRestockSchedule();
  const key = String(productId);
  schedule[key] = { day: clamped, done: schedule[key]?.done ?? false };
  await setRestockSchedule(schedule);
  revalidatePath("/plan");
}

/** Toggle whether a restock item has been bought this cycle. */
export async function toggleRestockDone(productId: number, day: number) {
  const schedule = await getRestockSchedule();
  const key = String(productId);
  const current = schedule[key];
  schedule[key] = {
    day: current?.day ?? Math.min(31, Math.max(1, Math.round(day))),
    done: !(current?.done ?? false),
  };
  await setRestockSchedule(schedule);
  revalidatePath("/plan");
}

/** Save the current cookie plan to the signed-in user's account (Supabase). */
export async function savePlanToAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ids = await getPlanIds();
  const { data: plan, error } = await supabase
    .from("plans")
    .upsert({ user_id: user.id, spec: {}, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("plan_products").delete().eq("plan_id", plan.id);
  if (ids.length) {
    await supabase.from("plan_products").insert(ids.map((product_id) => ({ plan_id: plan.id, product_id })));
  }
  revalidatePath("/plan");
}
