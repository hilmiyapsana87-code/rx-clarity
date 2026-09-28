import { createFileRoute } from "@tanstack/react-router";

import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { AddMedicineForm, DemoLabel, EmptyState, InteractionMap, PageHeader } from "@/components/rxlens/med-ui";
import { useSession } from "@/lib/medicine-session";

export const Route = createFileRoute("/interactions")({
  head: () => ({
    meta: [
      { title: "Interaction Checker — RxLens" },
      { name: "description", content: "Compare medicines from your prescription for potential drug–drug interactions, with cited sources." },
      { property: "og:title", content: "Interaction Checker — RxLens" },
      { property: "og:description", content: "Prescription Interaction Map: see potential interactions and what to discuss with your pharmacist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Interactions,
});

function Interactions() {
  const { source, medicines } = useSession();
  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHeader eyebrow="Interactions" title="Prescription Interaction Map" text="Every pair of medicines is compared against the RxLens reference data. If something is flagged, discuss it with your doctor or pharmacist — never stop or change a medicine on your own." />
      {source === "demo" ? <DemoLabel /> : null}
      <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <AddMedicineForm />
      </article>
      {medicines.length === 0 ? (
        <EmptyState title="Nothing to compare yet" text="Load a prescription or add two or more medicines above." />
      ) : (
        <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <InteractionMap meds={medicines} />
          <p className="mt-4 text-xs text-muted-foreground">The prototype reference data covers a limited set of medicines and interactions. "No known interaction" only means none is listed here.</p>
        </article>
      )}
      <SafetyBanner />
    </section>
  );
}
