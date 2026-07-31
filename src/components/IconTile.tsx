export default function IconTile({
  icon,
  size = "md",
  dimmed = false,
}: {
  icon: string;
  size?: "md" | "lg";
  /** Fade + desaturate for "already handled" items (e.g. bought in the calendar). */
  dimmed?: boolean;
}) {
  const s = size === "lg" ? "h-16 w-16 text-3xl" : "h-11 w-11 text-2xl";
  return (
    <div
      className={`flex ${s} shrink-0 items-center justify-center rounded-2xl bg-cream-sunk ${
        dimmed ? "opacity-40 grayscale" : ""
      }`}
      aria-hidden="true"
    >
      {icon}
    </div>
  );
}
