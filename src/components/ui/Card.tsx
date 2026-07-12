import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/**
 * Card — official primitive per DESIGN §9 / §7.
 * White surface, 1px border-default, radius-xlarge (24px), padding 20–24px.
 * Shadow is optional (border-led by default, per §9.3).
 */
export default function Card({
  shadow = false,
  className,
  ...props
}: {
  shadow?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border-default bg-surface-white p-5",
        shadow && "shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
