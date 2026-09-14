"use client";

import { useState, useTransition } from "react";
import { saveProductNote } from "@/app/actions";

/**
 * Collapsible per-item note. Shows a preview line when collapsed with a note,
 * a textarea when open. Saves on blur (empty note clears it).
 */
export default function NoteEditor({
  productId,
  note,
}: {
  productId: number;
  note: string;
}) {
  const hasNote = note.trim() !== "";
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note);
  const [, startTransition] = useTransition();

  const save = () => {
    if (text.trim() === note.trim()) {
      return;
    }
    startTransition(() => saveProductNote(productId, text));
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {hasNote ? "โน้ต" : "เพิ่มโน้ต"}
        <span aria-hidden="true" className="text-[10px]">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          rows={2}
          maxLength={500}
          placeholder="เช่น รอโปรลดราคา · เอาสีขาว · ขนาดไม่เกิน 40 ซม."
          className="mt-1 w-full rounded-xl border border-ink/10 bg-cream-card p-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
      ) : (
        hasNote && (
          <p className="mt-0.5 whitespace-pre-line text-xs text-ink-soft">{note}</p>
        )
      )}
    </div>
  );
}
