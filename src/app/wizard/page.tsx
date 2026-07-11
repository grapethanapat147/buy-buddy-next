import AppLayout from "@/components/AppLayout";
import WizardForm from "@/components/WizardForm";
import AiPlannerForm from "@/components/AiPlannerForm";

export default function WizardPage() {
  return (
    <AppLayout>
      <WizardForm />
      <div className="mt-8 border-t border-ink/10 pt-6">
        <AiPlannerForm />
      </div>
    </AppLayout>
  );
}
