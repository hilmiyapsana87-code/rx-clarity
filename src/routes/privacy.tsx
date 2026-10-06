import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Center — RxLens" },
      { name: "description", content: "How RxLens handles your prescription image: processed for reading only, kept in browser memory, cleared on refresh." },
      { property: "og:title", content: "Privacy Center — RxLens" },
      { property: "og:description", content: "Plain-language explanation of what happens to your prescription image in RxLens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const POINTS: [string, string][] = [
  ["Sent for reading only", "When you analyze a real image, it is sent over an encrypted (HTTPS) connection to an external AI reading service so the text can be read."],
  ["Not stored by RxLens", "RxLens does not save your image or results on any server or database."],
  ["Held in browser memory", "Your image and results live only in this browser tab while you use it."],
  ["Cleared on refresh", "Refreshing or closing the page removes the image and all results."],
  ["Not shared by RxLens", "RxLens does not sell or share your prescription with anyone."],
  ["Demo data is fictional", "The demo prescriptions contain no real patient information."],
];

function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Privacy Center</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-foreground sm:text-5xl">Your prescription contains sensitive information.</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">Here is exactly what happens to it — honestly and simply.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {POINTS.map(([t, d]) => (
          <article key={t} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <Lock className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold text-foreground">{t}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{d}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-warning-foreground">
        RxLens is a prototype. A production version would need secure healthcare-grade infrastructure and formal privacy and compliance controls.
      </p>
    </section>
  );
}
