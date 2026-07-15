import { cookies } from "next/headers";
import { normalizeSpec, type Spec } from "./recommendation/types";

const SPEC_COOKIE = "bb_spec";
const PLAN_COOKIE = "bb_plan";
const RESTOCK_COOKIE = "bb_restock";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getSpec(): Promise<Spec | null> {
  const store = await cookies();
  const raw = store.get(SPEC_COOKIE)?.value;
  if (!raw) return null;
  try {
    return normalizeSpec(JSON.parse(raw) as Partial<Spec>);
  } catch {
    return null;
  }
}

export async function setSpec(spec: Spec): Promise<void> {
  const store = await cookies();
  store.set(SPEC_COOKIE, JSON.stringify(spec), COOKIE_OPTS);
}

export async function getPlanIds(): Promise<number[]> {
  const store = await cookies();
  const raw = store.get(PLAN_COOKIE)?.value;
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

export async function setPlanIds(ids: number[]): Promise<void> {
  const store = await cookies();
  store.set(PLAN_COOKIE, JSON.stringify([...new Set(ids)]), COOKIE_OPTS);
}

export type RestockSlot = { day: number; done: boolean };
export type RestockSchedule = Record<string, RestockSlot>;

export async function getRestockSchedule(): Promise<RestockSchedule> {
  const store = await cookies();
  const raw = store.get(RESTOCK_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as RestockSchedule) : {};
  } catch {
    return {};
  }
}

export async function setRestockSchedule(schedule: RestockSchedule): Promise<void> {
  const store = await cookies();
  store.set(RESTOCK_COOKIE, JSON.stringify(schedule), COOKIE_OPTS);
}
