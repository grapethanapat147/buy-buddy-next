"use server";

import { revalidatePath } from "next/cache";
import { saveSpec } from "./actions";
import { parseSpec } from "@/lib/planner";
import { getSpec, setSpec } from "@/lib/session";
import type { Spec } from "@/lib/recommendation/types";

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

/** A gap the description left open, asked back as one tappable question. */
export type FollowUp = {
  field: "budget" | "occupants" | "cooking" | "laundry" | "work_style" | "spending_style";
  question: string;
  choices: Array<{ value: string; label: string }>;
};

/** Signals that mean the user actually told us this field, rather than us defaulting it. */
const MENTIONED: Record<FollowUp["field"], RegExp> = {
  budget: /\d/,
  occupants: /\d+\s*คน|คนเดียว|อยู่กัน|แฟน|เพื่อน|รูมเมท/,
  cooking: /ทำอาหาร|ทำกับข้าว|ทำครัว|ไม่ทำ|สั่ง|เดลิเวอรี|กินข้าวนอก|cook/i,
  laundry: /ซัก|เครื่องซัก|ส่งร้าน|ร้านซัก|หยอดเหรียญ|laundry/i,
  work_style: /ทำงาน|ออฟฟิศ|wfh|บริษัท|เรียน|มหาลัย|office/i,
  spending_style: /ประหยัด|ถูก|จำเป็น|คุ้ม|จัดเต็ม|ครบ|สบาย|งบน้อย/,
};

const QUESTIONS: Record<FollowUp["field"], Omit<FollowUp, "field">> = {
  budget: {
    question: "ตั้งงบไว้ประมาณเท่าไหร่",
    choices: [
      { value: "3000", label: "฿3,000" },
      { value: "5000", label: "฿5,000" },
      { value: "8000", label: "฿8,000" },
      { value: "12000", label: "฿12,000" },
    ],
  },
  occupants: {
    question: "อยู่กี่คน",
    choices: [
      { value: "1", label: "คนเดียว" },
      { value: "2", label: "2 คน" },
      { value: "3", label: "3 คน" },
    ],
  },
  cooking: {
    question: "ทำอาหารเองบ่อยแค่ไหน",
    choices: [
      { value: "never", label: "ไม่ทำเลย" },
      { value: "sometimes", label: "1–3 วัน/สัปดาห์" },
      { value: "often", label: "4–7 วัน/สัปดาห์" },
    ],
  },
  laundry: {
    question: "ซักผ้ายังไง",
    choices: [
      { value: "own_machine", label: "มีเครื่องซัก" },
      { value: "hand", label: "ซักมือ" },
      { value: "service", label: "ส่งร้าน" },
    ],
  },
  work_style: {
    question: "ทำงานที่ไหนเป็นหลัก",
    choices: [
      { value: "office", label: "ออฟฟิศ" },
      { value: "home", label: "ที่ห้อง" },
      { value: "hybrid", label: "ผสม" },
    ],
  },
  spending_style: {
    question: "สไตล์การซื้อของเป็นแบบไหน",
    choices: [
      { value: "essentials", label: "เอาที่จำเป็น" },
      { value: "balanced", label: "พอดี ๆ" },
      { value: "comfort", label: "อยากได้ครบ" },
    ],
  },
};

const FIELD_ORDER: FollowUp["field"][] = [
  "budget",
  "occupants",
  "cooking",
  "laundry",
  "work_style",
  "spending_style",
];

function summarize(spec: Spec): string[] {
  return [
    `งบ ฿${spec.budget.toLocaleString()}`,
    `อยู่ ${spec.occupants} คน`,
    SIZE_LABEL[spec.roomSize] ?? "",
    COOKING_LABEL[spec.cooking] ?? "",
    LAUNDRY_LABEL[spec.laundry] ?? "",
    WORK_LABEL[spec.workStyle] ?? "",
  ].filter(Boolean);
}

/**
 * Chat variant of the planner: parse + save the spec but DON'T redirect, so the
 * assistant can echo back what it understood in-conversation before the user taps
 * through to the recommendations. Uses the Anthropic model when a key is present,
 * otherwise the deterministic heuristic — same as {@link planFromText}.
 *
 * It also reports which fields the description never mentioned, so the chat can
 * ask them back one at a time instead of silently guessing.
 */
export async function consultSpec(
  text: string,
): Promise<{ points: string[]; followUps: FollowUp[] }> {
  const spec = await parseSpec(text);
  await setSpec(spec);
  revalidatePath("/recommendations");
  revalidatePath("/plan");
  revalidatePath("/explore");

  const followUps = FIELD_ORDER.filter((field) => !MENTIONED[field].test(text)).map((field) => ({
    field,
    ...QUESTIONS[field],
  }));

  return { points: summarize(spec), followUps };
}

/** Apply one tapped follow-up answer onto the saved spec. */
export async function answerFollowUp(
  field: FollowUp["field"],
  value: string,
): Promise<{ points: string[] }> {
  const current = await getSpec();
  if (!current) {
    return { points: [] };
  }

  const next: Spec = { ...current };
  switch (field) {
    case "budget":
      next.budget = Number(value) || current.budget;
      break;
    case "occupants":
      next.occupants = Number(value) || current.occupants;
      break;
    case "cooking":
      next.cooking = value;
      break;
    case "laundry":
      next.laundry = value;
      break;
    case "work_style":
      next.workStyle = value;
      break;
    case "spending_style":
      next.spendingStyle = value;
      break;
  }

  await setSpec(next);
  revalidatePath("/recommendations");
  revalidatePath("/plan");
  revalidatePath("/explore");

  return { points: summarize(next) };
}
