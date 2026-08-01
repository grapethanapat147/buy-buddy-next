"use client";

import { useState } from "react";
import IconTile from "./IconTile";

/**
 * A real product photo when one is stored, otherwise the emoji IconTile. Falls
 * back to the emoji too if the image fails to load, so a bad URL never leaves a
 * broken image on the page.
 */
export default function ProductImage({
  imageUrl,
  icon,
  name,
  size = "lg",
}: {
  imageUrl: string | null;
  icon: string;
  name: string;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return <IconTile icon={icon} size={size} />;
  }

  const dim = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      onError={() => setFailed(true)}
      className={`${dim} shrink-0 rounded-2xl bg-cream-sunk object-cover`}
    />
  );
}
