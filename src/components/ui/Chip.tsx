import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

/**
 * Chip — pill selector per DESIGN §9.1 / §11 (radius-pill).
 * Selected uses primary-soft surface + primary border, per §5.
 */
export default function Chip({
  selected = false,
  className,
  ...props
}: {
  selected?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "inline-flex min-h-[36px] items-center justify-center rounded-full border px-4 text-[14px] font-medium transition select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        selected
          ? "border-primary bg-primary-soft text-primary-pressed"
          : "border-border-default bg-surface-white text-text-secondary hover:bg-surface-hover",
        className,
      )}
      {...props}
    />
  );
}
