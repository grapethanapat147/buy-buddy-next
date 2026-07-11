export type MascotMood = "happy" | "celebrate" | "thinking" | "caring";

const faces: Record<MascotMood, string> = {
  happy: "🛍️",
  celebrate: "🎉",
  thinking: "🤔",
  caring: "🤗",
};

export default function Mascot({
  mood = "happy",
  className = "",
}: {
  mood?: MascotMood;
  className?: string;
}) {
  return (
    <span className={className} role="img" aria-label={`mascot ${mood}`}>
      {faces[mood] ?? faces.happy}
    </span>
  );
}
