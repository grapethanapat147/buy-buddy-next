import Image from "next/image";

export type MascotMood =
  | "happy"
  | "holding"
  | "deal"
  | "celebrate"
  | "search"
  | "thinking"
  | "caring";

const moodToFile: Record<MascotMood, string> = {
  happy: "illus1",
  holding: "illus2",
  deal: "illus3",
  celebrate: "illus4",
  search: "illus5",
  thinking: "illus6",
  caring: "illus2", // alias of holding
};

const moodToAlt: Record<MascotMood, string> = {
  happy: "มาสคอตถุงช้อปปิ้งยิ้มทักทาย",
  holding: "มาสคอตถุงช้อปปิ้งถือของ",
  deal: "มาสคอตถุงช้อปปิ้งกับดีลคุ้มค่า",
  celebrate: "มาสคอตถุงช้อปปิ้งฉลอง",
  search: "มาสคอตถุงช้อปปิ้งกำลังค้นหา",
  thinking: "มาสคอตถุงช้อปปิ้งกำลังคิด",
  caring: "มาสคอตถุงช้อปปิ้งถือของ",
};

export default function Mascot({
  mood = "happy",
  size = 96,
  className = "",
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  const file = moodToFile[mood] ?? moodToFile.happy;
  return (
    <Image
      src={`/mascot/${file}.png`}
      alt={moodToAlt[mood] ?? moodToAlt.happy}
      width={size}
      height={size}
      className={className}
      priority={size >= 140}
    />
  );
}
