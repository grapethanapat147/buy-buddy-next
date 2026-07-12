import confetti from "canvas-confetti";

type Origin = { x: number; y: number };

/** Fire a small brand-colored confetti burst. No-op under reduced motion. */
export function celebrate(origin: Origin = { x: 0.5, y: 0.4 }): void {
  if (typeof window === "undefined") {
    return;
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 32,
    origin,
    colors: ["#FF8A6E", "#FFC18B", "#FFE1B5", "#4F9B78", "#FFF0EA"],
    scalar: 0.9,
  });
}
