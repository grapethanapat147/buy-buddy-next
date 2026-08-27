import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

/**
 * Button — official primitive per DESIGN §11.
 * Variants: primary (main CTA), secondary (secondary action), tertiary (low-emphasis links).
 * Sizes: small 40px / medium 48px / large 56px. Touch target kept at min 44px.
 */
type Variant = "primary" | "secondary" | "tertiary";
type Size = "small" | "medium" | "large";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 " +
  "disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-brand-grad text-text-on-primary shadow-soft hover:brightness-105",
  secondary:
    "bg-surface-white border border-primary text-primary-pressed hover:bg-surface-hover",
  tertiary: "bg-transparent text-primary-pressed hover:bg-surface-hover",
};

const sizes: Record<Size, string> = {
  small: "min-h-[44px] px-4 text-[14px] rounded-[16px]",
  medium: "h-[48px] px-5 text-[16px] rounded-[16px]",
  large: "h-[56px] px-6 text-[18px] rounded-[16px]",
};

export default function Button({
  variant = "primary",
  size = "medium",
  pill = false,
  className,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        pill && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}
