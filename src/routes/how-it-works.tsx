import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/rxlens/section-heading";
import { workflowSteps } from "@/lib/rxlens-demo";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How RxLens Works — Prescription Understanding Workflow" },
      { name: "description", content: "See the four-step RxLens workflow: upload, read, organize, and understand prescription information with verification guidance." },
      { property: "og:title", content: "How RxLens Works — Prescription Understanding Workflow" },
      { property: "og:description", content: "A clear visual workflow for the RxLens hackathon prototype." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading eyebrow="Workflow" title="From handwritten note to structured understanding">
        RxLens separates reading, organization, and educational explanation so users know what was detected and what still needs verification.
      </SectionHeading>

      <div className="relative mt-14 grid gap-5 lg:grid-cols-4 lg:gap-6">
        <div className="absolute left-0 right-0 top-16 hidden h-px bg-border lg:block" aria-hidden="true" />
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.number} className="relative animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card" style={{ animationDelay: `${index * 90}ms` }}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 lg:block">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-clinical-gradient text-primary-foreground shadow-lens">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 lg:mt-6">
                  <p className="text-sm font-extrabold tracking-widest text-primary">{step.number}</p>
                  <h2 className="mt-1 truncate font-display text-2xl font-bold text-foreground">{step.title}</h2>
                </div>
              </div>
              <p className="mt-4 leading-7 text-muted-foreground">{step.text}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="hero" size="lg">
          <Link to="/analyze">
            Try the demo workflow
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
