"use client";

import { useState } from "react";

export default function IconTile({
  icon,
  imageUrl = null,
  size = "md",
  dimmed = false,
}: {
  icon: string;
  /** Real product photo; falls back to the emoji when absent or it fails to load. */
  imageUrl?: string | null;
  size?: "md" | "lg";
  /** Fade + desaturate for "already handled" items (e.g. bought in the calendar). */
  dimmed?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const showImage = imageUrl && !failed;

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cream-sunk ${
        showImage ? "" : size === "lg" ? "text-3xl" : "text-2xl"
      } ${dimmed ? "opacity-40 grayscale" : ""}`}
      aria-hidden="true"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        icon
      )}
    </div>
  );
}
