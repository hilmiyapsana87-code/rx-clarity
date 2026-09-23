import { createFileRoute } from "@tanstack/react-router";
import { DatabaseZap, LockKeyhole, ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/rxlens/section-heading";
import { innovationCards } from "@/lib/rxlens-demo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RxLens — Healthcare Hackathon Prototype" },
      { name: "description", content: "Learn about RxLens, a confidence-aware prescription-understanding prototype designed for a 24-hour healthcare hackathon." },
      { property: "og:title", content: "About RxLens — Healthcare Hackathon Prototype" },
      { property: "og:description", content: "RxLens converts difficult prescription information into a clearer, structured format while emphasizing professional verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading eyebrow="About RxLens" title="A safer way to explain the uncertainty">
        RxLens is a prototype designed to reduce confusion caused by difficult-to-read prescriptions by converting prescription information into a clearer, structured format.
      </SectionHeading>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {innovationCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold leading-7 text-foreground">{card.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{card.text}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)]">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
            <div className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Prototype scope</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                RxLens uses fictional demo data in this MVP. It does not claim clinical validation, and it does not replace a doctor or pharmacist.
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-border bg-soft-panel p-6 shadow-card">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <DatabaseZap className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-foreground">Data & privacy</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Your prescription contains sensitive information.</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li className="flex gap-2"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Do not store real patient data in this prototype.</li>
            <li className="flex gap-2"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Do not expose uploaded images publicly.</li>
            <li className="flex gap-2"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Use fictional demo data for judging.</li>
            <li className="flex gap-2"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />Production would require secure healthcare-grade infrastructure and privacy controls.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
