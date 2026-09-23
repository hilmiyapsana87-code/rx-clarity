import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PrescriptionVisual } from "@/components/rxlens/prescription-visual";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { benefitCards } from "@/lib/rxlens-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RxLens — See your prescription clearly" },
      {
        name: "description",
        content: "RxLens is a healthcare hackathon prototype that helps patients understand handwritten prescriptions with confidence-aware guidance.",
      },
      { property: "og:title", content: "RxLens — See your prescription clearly" },
      {
        property: "og:description",
        content: "A polished prescription-understanding assistant for organizing medicines, explaining general uses, and encouraging professional verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:px-8 lg:py-16">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            24-hour healthcare hackathon prototype
          </div>
          <h1 className="mt-7 font-display text-5xl font-extrabold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            RxLens
          </h1>
          <p className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            See your prescription clearly.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Understand what your prescription says — without replacing the guidance of your doctor or pharmacist.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link to="/analyze">
                Analyze Prescription
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="clinical" size="lg">
              <Link to="/how-it-works">
                <PlayCircle aria-hidden="true" />
                See How It Works
              </Link>
            </Button>
          </div>
        </div>
        <PrescriptionVisual />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {benefitCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-foreground">{card.title}</h2>
                <p className="mt-2 leading-7 text-muted-foreground">{card.text}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8">
          <SafetyBanner />
        </div>
      </section>
    </div>
  );
}
