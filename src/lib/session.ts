import { cookies } from "next/headers";
import type { Spec } from "./recommendation/types";

const SPEC_COOKIE = "bb_spec";
const PLAN_COOKIE = "bb_plan";
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
    return JSON.parse(raw) as Spec;
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
