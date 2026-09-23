import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { SectionHeading } from "@/components/rxlens/section-heading";
import { safetyChecks } from "@/lib/rxlens-demo";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "RxLens Safety Center — Before you act" },
      { name: "description", content: "RxLens safety guidance: verify prescription details with a doctor or pharmacist and never change treatment based on prototype output." },
      { property: "og:title", content: "RxLens Safety Center — Before you act" },
      { property: "og:description", content: "Clear safety guidance for using the RxLens prescription-understanding prototype responsibly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading eyebrow="Safety Center" title="Before you act">
        RxLens is built around verification. It helps organize information, but healthcare decisions stay with qualified professionals.
      </SectionHeading>

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {safetyChecks.map((check) => (
          <article key={check} className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold leading-6 text-foreground">{check}</h2>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-destructive/30 bg-danger-soft p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
          <div className="grid size-12 place-items-center rounded-2xl bg-destructive text-destructive-foreground">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">RxLens does not diagnose conditions, prescribe medicines, or tell you to start, stop, or change treatment.</h2>
            <p className="mt-3 text-lg leading-8 text-muted-foreground">Always follow the prescription and advice provided by your qualified healthcare professional.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SafetyBanner compact />
      </div>
    </section>
  );
}
