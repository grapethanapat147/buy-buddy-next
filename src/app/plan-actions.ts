"use server";

import { saveSpec } from "./actions";
import { parseSpec } from "@/lib/planner";

/** Parse a free-text Thai sentence into a Spec, save it, and land on /recommendations. */
export async function planFromText(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return;
  }
  const spec = await parseSpec(text);
  await saveSpec(spec);
}
