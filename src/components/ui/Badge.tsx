import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/**
 * Badge — small status label per DESIGN §9.1 (radius-small 8px) / §5.6.
 * Tones map to the official status palette (soft background + solid text).
 */
type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-text-secondary",
  primary: "bg-primary-soft text-primary-pressed",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
};

export default function Badge({
  tone = "neutral",
  className,
  ...props
}: {
  tone?: Tone;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[8px] px-2 py-0.5 text-[13px] font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
