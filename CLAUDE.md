@AGENTS.md

# BuyBuddy (buy-buddy-next)

แอปช่วยผู้เช่าจัดของเข้าห้องตามงบ — แนะนำของที่ต้องซื้อ เทียบราคาร้าน (Shopee/Lazada/TikTok) วางแผนซื้อซ้ำ
Mobile-first, UI ภาษาไทยทั้งแอป, สถานะ = MVP ที่ deploy จริง ใช้กับเพื่อน 2 คน
**อย่าสับสนกับ `~/Herd/buy-buddy` (ตัว Laravel เก่า) — โปรเจกต์นี้คือตัวจริงที่พัฒนาต่อ**

- Prod: https://buy-buddy-next.vercel.app · Repo: `grapethanapat147/buy-buddy-next`
- Push `master` = Vercel auto-deploy ทันที (~1 นาที) — push คือ deploy จริง ระวังเสมอ

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (`@theme` tokens ใน `src/styles/tokens.css`)
motion/react · Supabase (SSR client + service-role admin client) · Vitest · ฟอนต์ Mitr (h1) + IBM Plex Sans Thai (body) ผ่าน next/font

## ⚠️ กฎเหล็กเรื่องฐานข้อมูล (พังมาแล้ว อย่าซ้ำ)

มี 2 ฐาน: **dev = Supabase local** (`npx supabase start`, ต้องเปิด Docker ก่อน, API :54321) / **prod = Supabase cloud** project `tpgzwrrafxcsbrsppvip` (ไม่มี CLI push — user วาง SQL ใน cloud SQL Editor เอง)

ลำดับเปลี่ยน schema: เขียน migration → `npx supabase migration up` (local) → verify → commit → **ให้ user รัน SQL (idempotent) ใน cloud SQL Editor ให้เสร็จก่อน** → ค่อย push โค้ดที่พึ่ง schema นั้น — push ก่อนรัน SQL = query พังทั้ง prod
`service_role` bypass RLS แต่**ต้องมี table-level GRANT แยกต่างหาก** ไม่งั้น 42501 — admin เขียน table ใหม่เมื่อไหร่ ต้องมี grant migration คู่กัน

## คำสั่งประจำ

```bash
npx supabase start                # ต้องรันก่อน dev (ต้องมี Docker)
PORT=3100 npm run dev             # dev server ที่ :3100
NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npx next build
npx vitest run                    # ต้องเขียว (29+ tests) ก่อน push เสมอ
npx eslint <ไฟล์ที่แก้>
```

Verify UI ด้วย in-app browser ที่ mobile preset 375×812 · หลัง restart dev คลิกแรกมักโดนก่อน hydrate — รอ ~1 วิแล้วคลิกใหม่ · ถ้า CSS/JS ใหม่ไม่ขึ้นทั้งที่แก้แล้ว: `rm -rf .next` แล้ว start dev ใหม่ (build prod ค้างใน `.next` ทำ dev เสิร์ฟของเก่า)

## แผนที่ฟีเจอร์

- `/wizard` — 8 ข้อ สไตล์ Duolingo (แตะแล้ว auto-advance) · ข้อ 8 "ในห้องมีอะไรอยู่แล้ว" = 4 fixture + 14 owned candidates (รองรับห้องเช่าแบบมีเฟอร์)
- `/recommendations` — "ของแนะนำสำหรับคุณ" (จาก engine ใน `src/lib/recommendation/`) ตามด้วย "ของอื่น ๆ" ทั้งคลัง · ของที่ user บอกว่ามีแล้ว: โชว์เป็น chip "✓ มีอยู่แล้วในห้อง" และห้ามโผล่เป็นของให้กดเพิ่ม
- `/explore` — ค้นหา/กรองหมวด · ของที่มีแล้วติดป้ายเขียว "มีแล้ว" (ยังค้นเจอ แต่ไม่เชียร์ซ้ำ) · ค้นไม่เจอมี fallback (ดูทั้งหมด/Google/ของใกล้เคียง)
- `/plan` — กระเป๋า + แท็บปฏิทินซื้อซ้ำ (restock) · state guest อยู่ใน httpOnly cookies (`bb_plan`, `bb_spec`, `bb_restock`, `bb_notes`) · ล็อกอินแล้ว save เข้าบัญชีได้
- `/assistant` — แชทจัดสเปกจากข้อความ: ตอนนี้ heuristic (`src/lib/planner.ts`), มี `ANTHROPIC_API_KEY` เมื่อไหร่สลับใช้ Claude เอง · แผนอนาคต: Grok (research จาก X) + Gemini (ตอบ) — ต้องเพิ่ม `@ai-sdk/xai` + `@ai-sdk/google` (dependency ใหม่ = ขอ user ก่อน)
- `/admin` — allowlist จาก env `ADMIN_EMAILS` (3 อีเมล) · กรอกราคา/ลิงก์ร้าน/URL รูปสินค้า · เขียนด้วย service-role client
- LINE Login — custom OAuth (Supabase ไม่มี provider LINE): channel 2010884595, **scope `openid profile` เท่านั้น** (ห้ามใส่ `email` — บัญชีไม่ผูกอีเมลจะล็อกอินพัง), สร้าง user ปลอม `line_<sub>@line.local` bridge เข้า Supabase · channel ต้องเป็น Published ไม่ใช่ Developing

## รูปสินค้า

รูปจริงอยู่ `public/products/<slug>.png` (320px) · DB ชี้ผ่าน `products.image_url` · `IconTile` รับ `imageUrl` แล้ว fallback เป็น emoji เมื่อไม่มีรูป/โหลดพัง · สินค้าที่ยังไม่มีรูป: `induction-cooker`, `dining-table-rounded`

## กติกา design (ผ่านการรีวิวจากเพื่อน user มาแล้ว)

- โทน cream + ส้ม brand — **สีเขียวใช้เชิงความหมายเท่านั้น** (อยู่ในงบ / คุ้มสุด / ซื้อแล้ว) ห้ามใช้กับ state เลือก/in-plan (ต้องส้ม)
- **ห้าม emoji ตกแต่ง** — ที่อนุญาต: emoji สินค้า (ใน IconTile), การ์ดตัวเลือก wizard, 🎉 ตอนฉลอง, ✓ semantic
- ปุ่มหลักใช้ `.bg-brand-grad` (นิยามใน `globals.css`) + `hover:brightness-105` — ไม่ใช้ `bg-brand` แบนๆ
- h1 = ฟอนต์ Mitr อัตโนมัติ (rule ใน globals) · การ์ด/แถว = `rounded-2xl` · ไทยตัดบรรทัดเองไม่ได้ ใช้ `\n` + `whitespace-pre-line break-keep` เมื่อต้องคุมจุดตัด

## กติกาการทำงาน

- ตอบภาษาไทย ศัพท์เทคนิคคงอังกฤษ · เรียก user ว่า "เกรพ" ได้
- dependency ใหม่ต้องขออนุญาตก่อน · ทุกการแก้ต้อง build + `npx vitest run` เขียวก่อน push
- ห้ามถือ/ขอ secret ใน chat — user ใส่ key ใน Vercel/Supabase dashboard เอง
- Env vars บน Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`
