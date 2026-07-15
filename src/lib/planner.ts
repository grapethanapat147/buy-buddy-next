import { z } from "zod";
import type { Spec } from "./recommendation/types";

export const specSchema = z.object({
  budget: z.number().describe("งบประมาณเป็นบาท เช่น 5000"),
  roomType: z.string().describe("ประเภทห้อง เช่น studio").default("studio"),
  room_size: z
    .enum(["small", "medium", "large"])
    .describe("ขนาดห้อง: small (<25 ตร.ม.), medium (25-35), large (>35)")
    .default("small"),
  occupants: z.number().int().min(1).describe("จำนวนคนที่อยู่ในห้อง"),
  cooking: z.enum(["never", "sometimes", "often"]).describe("ความถี่ในการทำอาหาร"),
  laundry: z.enum(["own_machine", "hand", "service"]).describe("วิธีซักผ้า"),
  work_style: z.enum(["home", "office", "hybrid"]).describe("รูปแบบการทำงาน"),
  spending_style: z
    .enum(["essentials", "balanced", "comfort"])
    .describe("สไตล์การใช้จ่าย"),
  has_kitchen_counter: z.boolean().describe("ห้องมีเคาน์เตอร์ครัวอยู่แล้วไหม").default(false),
  has_wardrobe: z.boolean().describe("ห้องมีตู้เสื้อผ้าอยู่แล้วไหม").default(false),
  has_dining_table: z.boolean().describe("ห้องมีโต๊ะกินข้าวอยู่แล้วไหม").default(false),
  has_aircon: z.boolean().describe("ห้องมีแอร์อยู่แล้วไหม").default(false),
});

export type SpecShape = z.infer<typeof specSchema>;

function toSpec(shape: SpecShape): Spec {
  return {
    budget: shape.budget,
    roomType: shape.roomType || "studio",
    roomSize: shape.room_size,
    occupants: shape.occupants,
    cooking: shape.cooking,
    laundry: shape.laundry,
    workStyle: shape.work_style,
    spendingStyle: shape.spending_style,
    hasKitchenCounter: shape.has_kitchen_counter,
    hasWardrobe: shape.has_wardrobe,
    hasDiningTable: shape.has_dining_table,
    hasAircon: shape.has_aircon,
    ownedProductIds: [],
  };
}

/** Best-effort Thai/English keyword parse used when no API key is present or the model call fails. */
export function heuristicParse(text: string): Spec {
  const t = text.toLowerCase();

  const sqmMatch = text.match(/(\d+)\s*(?:ตร\.?\s?ม\.?|ตารางเมตร|sqm|sq\.?m)/i);
  const sqm = sqmMatch ? Number(sqmMatch[1]) : null;

  const numbers = (text.match(/\d[\d,]*/g) ?? [])
    .map((n) => Number(n.replace(/,/g, "")))
    .filter((n) => n !== sqm);
  const budget = numbers.length ? Math.max(...numbers) : 5000;

  let roomSize: Spec["roomSize"] = "small";
  if (sqm !== null) {
    roomSize = sqm > 35 ? "large" : sqm >= 25 ? "medium" : "small";
  } else if (/ห้องใหญ่|กว้าง|large/.test(t)) {
    roomSize = "large";
  } else if (/ห้องเล็ก|ห้องแคบ|คับแคบ|small/.test(t)) {
    roomSize = "small";
  }

  const hasFixture = (re: RegExp) => re.test(t);

  let occupants = 1;
  const occMatch = text.match(/(\d+)\s*คน/);
  if (occMatch) {
    occupants = Math.max(1, Number(occMatch[1]));
  } else if (/คนเดียว|อยู่คนเดียว|alone/.test(t)) {
    occupants = 1;
  }

  let cooking: Spec["cooking"] = "sometimes";
  if (/ไม่ทำอาหาร|ไม่ค่อยทำ|ไม่ทำ|never cook|ไม่ทำเลย/.test(t)) {
    cooking = "never";
  } else if (/ทำอาหารบ่อย|ทำบ่อย|ทำทุกวัน|cook often/.test(t)) {
    cooking = "often";
  } else if (/ทำอาหาร|ทำบ้าง|ทำกับข้าว|cook/.test(t)) {
    cooking = "sometimes";
  }

  let laundry: Spec["laundry"] = "own_machine";
  if (/ซักมือ|hand wash/.test(t)) {
    laundry = "hand";
  } else if (/ส่งร้าน|ร้านซัก|ซักรีด|laundry service/.test(t)) {
    laundry = "service";
  }

  let workStyle: Spec["workStyle"] = "office";
  if (/ทำงานที่บ้าน|ทำงานที่ห้อง|อยู่บ้าน|wfh|work from home/.test(t)) {
    workStyle = "home";
  } else if (/ผสม|hybrid|สลับ/.test(t)) {
    workStyle = "hybrid";
  } else if (/ออฟฟิศ|office|ที่ทำงาน/.test(t)) {
    workStyle = "office";
  }

  let spendingStyle: Spec["spendingStyle"] = "balanced";
  if (/ประหยัด|เท่าที่จำเป็น|เอาที่จำเป็น|essentials|ถูก/.test(t)) {
    spendingStyle = "essentials";
  } else if (/อยากได้ครบ|สบาย|ครบ ๆ|comfort|จัดเต็ม/.test(t)) {
    spendingStyle = "comfort";
  }

  return {
    budget,
    roomType: "studio",
    roomSize,
    occupants,
    cooking,
    laundry,
    workStyle,
    spendingStyle,
    hasKitchenCounter: hasFixture(/มีเคาน์เตอร์|มีเคาเตอร์|เคาน์เตอร์ครัวแล้ว|มีครัวอยู่แล้ว/),
    hasWardrobe: hasFixture(/มีตู้เสื้อผ้า|ตู้เสื้อผ้าแล้ว|มีตู้อยู่แล้ว|บิวท์อิน/),
    hasDiningTable: hasFixture(/มีโต๊ะกินข้าว|มีโต๊ะอาหาร|โต๊ะกินข้าวแล้ว/),
    hasAircon: hasFixture(/มีแอร์|แอร์แล้ว|มีเครื่องปรับอากาศ/),
    ownedProductIds: [],
  };
}

/**
 * Parse a free-text Thai sentence into a Spec. Uses the Anthropic model when
 * ANTHROPIC_API_KEY is set; otherwise (or on any failure) falls back to a
 * deterministic keyword heuristic so it never crashes on a missing key.
 */
export async function parseSpec(text: string): Promise<Spec> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.trim() === "") {
    return heuristicParse(text);
  }

  try {
    const { generateObject } = await import("ai");
    const { anthropic } = await import("@ai-sdk/anthropic");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-5"),
      schema: specSchema,
      prompt:
        "ผู้ใช้กำลังจัดของเข้าห้องเช่า/คอนโด และเล่าความต้องการเป็นภาษาไทยแบบธรรมชาติ " +
        "แปลงประโยคด้านล่างเป็นข้อมูลตาม schema ให้ครบทุกฟิลด์ เดาอย่างสมเหตุสมผลถ้าไม่ได้ระบุ " +
        `(งบเริ่มต้น 5000, อยู่ 1 คน)\n\nประโยค: "${text}"`,
    });

    return toSpec(object);
  } catch {
    return heuristicParse(text);
  }
}
