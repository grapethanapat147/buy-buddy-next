"use server";

import { revalidatePath } from "next/cache";
import { saveSpec } from "./actions";
import { parseSpec } from "@/lib/planner";
import { setSpec } from "@/lib/session";

/** Parse a free-text Thai sentence into a Spec, save it, and land on /recommendations. */
export async function planFromText(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return;
  }
  const spec = await parseSpec(text);
  await saveSpec(spec);
}

const SIZE_LABEL: Record<string, string> = {
  small: "ห้องเล็ก",
  medium: "ห้องขนาดกลาง",
  large: "ห้องใหญ่",
};
const COOKING_LABEL: Record<string, string> = {
  never: "ไม่ทำอาหาร",
  sometimes: "ทำอาหารบ้าง",
  often: "ทำอาหารบ่อย",
};
const LAUNDRY_LABEL: Record<string, string> = {
  own_machine: "มีเครื่องซัก",
  hand: "ซักมือ",
  service: "ส่งร้านซัก",
};
const WORK_LABEL: Record<string, string> = {
  office: "ทำงานออฟฟิศ",
  home: "ทำงานที่ห้อง",
  hybrid: "ทำงานแบบผสม",
};

/**
 * Chat variant of the planner: parse + save the spec but DON'T redirect, so the
 * assistant can echo back what it understood in-conversation before the user taps
 * through to the recommendations. Uses the Anthropic model when a key is present,
 * otherwise the deterministic heuristic — same as {@link planFromText}.
 */
export async function consultSpec(text: string): Promise<{ points: string[] }> {
  const spec = await parseSpec(text);
  await setSpec(spec);
  revalidatePath("/recommendations");
  revalidatePath("/plan");
  revalidatePath("/explore");

  return {
    points: [
      `งบ ฿${spec.budget.toLocaleString()}`,
      `อยู่ ${spec.occupants} คน`,
      SIZE_LABEL[spec.roomSize] ?? "",
      COOKING_LABEL[spec.cooking] ?? "",
      LAUNDRY_LABEL[spec.laundry] ?? "",
      WORK_LABEL[spec.workStyle] ?? "",
    ].filter(Boolean),
  };
}
