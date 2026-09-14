"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Mascot from "./Mascot";
import { answerFollowUp, consultSpec, type FollowUp } from "@/app/plan-actions";

type Message =
  | { role: "assistant"; text: string; points?: string[]; cta?: boolean }
  | { role: "user"; text: string };

const STARTERS = [
  "งบ 5000 อยู่คนเดียว ทำอาหารบ้าง",
  "งบ 8000 อยู่ 2 คน ไม่ทำอาหาร ส่งร้านซัก",
  "งบ 12000 ทำอาหารบ่อย ทำงานที่ห้อง",
];

export default function AssistantChat({ seedQuery = "" }: { seedQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>(
    seedQuery
      ? [
          {
            role: "assistant",
            text: `หา “${seedQuery}” ไม่เจอในคลังใช่ไหม — เล่าให้ฟังหน่อยว่าจะเอาไปใช้ทำอะไร และงบประมาณเท่าไหร่ เดี๋ยวหาของที่ใกล้เคียงให้`,
          },
        ]
      : [
          {
            role: "assistant",
            text: "สวัสดี เล่าเรื่องห้องของคุณมาได้เลย — งบเท่าไหร่ อยู่กี่คน ทำอาหารไหม เดี๋ยวจัดของให้",
          },
        ],
  );
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  /** Gaps the description left open, asked back one at a time. */
  const [queue, setQueue] = useState<FollowUp[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const toEnd = () =>
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));

  /** Ask the next open question, or wrap up with the summary + CTA when none are left. */
  const askNext = (remaining: FollowUp[], points: string[]) => {
    if (remaining.length === 0) {
      setQueue([]);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "ครบแล้ว! สรุปที่เข้าใจ—", points, cta: true },
      ]);
    } else {
      setQueue(remaining);
      setMessages((prev) => [...prev, { role: "assistant", text: remaining[0].question }]);
    }
    toEnd();
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) {
      return;
    }
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    startTransition(async () => {
      const res = await consultSpec(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            res.followUps.length > 0
              ? "เข้าใจแล้ว— ขอถามเพิ่มอีกนิดให้แม่นขึ้นนะ"
              : "จัดให้แล้ว! เข้าใจว่า—",
          points: res.points,
          cta: res.followUps.length === 0,
        },
      ]);
      askNext(res.followUps, res.points);
    });
  };

  const answer = (choice: { value: string; label: string }) => {
    if (pending || queue.length === 0) {
      return;
    }
    const current = queue[0];
    setMessages((prev) => [...prev, { role: "user", text: choice.label }]);
    startTransition(async () => {
      const res = await answerFollowUp(current.field, choice.value);
      askNext(queue.slice(1), res.points);
    });
  };

  const skipRest = () => {
    if (pending || queue.length === 0) {
      return;
    }
    setMessages((prev) => [...prev, { role: "user", text: "ข้ามไปดูผลเลย" }]);
    startTransition(async () => {
      const res = await answerFollowUp(queue[0].field, "");
      askNext([], res.points);
    });
  };

  return (
    <div className="mt-4 flex min-h-[64vh] flex-col">
      <div className="flex-1 space-y-3">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="flex items-start gap-2">
              <Mascot mood="thinking" size={30} />
              <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-cream-sunk px-3.5 py-2.5 text-sm text-ink">
                <p>{msg.text}</p>
                {msg.points && msg.points.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.points.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                {msg.cta && (
                  <Link
                    href="/recommendations"
                    className="mt-3 block rounded-full bg-brand-grad px-4 py-2.5 text-center text-sm font-semibold text-white shadow-soft transition hover:brightness-105 active:scale-[0.98]"
                  >
                    ดูของที่จัดให้ →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-brand px-3.5 py-2.5 text-sm text-white">
                {msg.text}
              </div>
            </div>
          ),
        )}
        {pending && (
          <div className="flex items-start gap-2">
            <Mascot mood="thinking" size={30} />
            <div className="rounded-2xl rounded-tl-sm bg-cream-sunk px-3.5 py-2.5 text-sm text-ink-muted">
              <span className="inline-flex gap-1">
                <span className="motion-safe:animate-bounce">·</span>
                <span className="motion-safe:animate-bounce [animation-delay:120ms]">·</span>
                <span className="motion-safe:animate-bounce [animation-delay:240ms]">·</span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-ink/12 px-3 py-1.5 text-xs text-ink-soft transition hover:bg-cream-sunk active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {queue.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {queue[0].choices.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={pending}
              onClick={() => answer(c)}
              className="rounded-full border border-brand/40 bg-brand-50 px-3.5 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100 active:scale-95 disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            disabled={pending}
            onClick={skipRest}
            className="rounded-full px-3 py-2 text-sm text-ink-muted underline-offset-4 transition hover:underline disabled:opacity-50"
          >
            ข้ามไปดูผลเลย
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 -mx-5 mt-4 flex items-end gap-2 bg-gradient-to-t from-cream-card via-cream-card to-transparent px-5 pb-1 pt-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="พิมพ์เล่าเรื่องห้องของคุณ…"
          className="max-h-28 flex-1 resize-none rounded-2xl border border-ink/10 bg-cream-card px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="ส่ง"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-soft transition hover:bg-brand-500 active:scale-90 disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
