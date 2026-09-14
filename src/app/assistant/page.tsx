import AppLayout from "@/components/AppLayout";
import AssistantChat from "@/components/AssistantChat";
import FlowTopNav from "@/components/FlowTopNav";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Arriving from a dead-end search: carry the term over so the chat opens on it.
  const { q = "" } = await searchParams;

  return (
    <AppLayout>
      <FlowTopNav backHref="/" />
      <h1 className="text-2xl font-bold text-ink">คุยกับ BuyBuddy</h1>
      <p className="mt-1 text-sm text-ink-soft">เล่าเรื่องห้องแบบสบาย ๆ เดี๋ยวจัดของให้</p>
      <AssistantChat seedQuery={q.trim()} />
    </AppLayout>
  );
}
