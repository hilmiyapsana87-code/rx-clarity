import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDown, ArrowRight, Info, Pill, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import {
  CheckRow, ConfidenceBadge, DemoLabel, EmptyState, InteractionMap, MatchNote, PageHeader, medLabel, pairResults,
} from "@/components/rxlens/med-ui";
import { medicineInfo } from "@/lib/medicine-data/provider";
import { confidenceLevel, useSession } from "@/lib/medicine-session";
import { scheduleSlots, type Slot } from "@/lib/instruction-decoder";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Medicine Safety Dashboard — RxLens" },
      { name: "description", content: "See detected medicines, reading confidence, potential interactions and your prescribed schedule in one place." },
      { property: "og:title", content: "Medicine Safety Dashboard — RxLens" },
      { property: "og:description", content: "A clear safety overview of your prescription, with verification reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const PIPELINE = [
  ["📷", "Prescription"], ["🔍", "OCR"], ["💊", "Medicine Identification"], ["🧪", "Ingredient Information"],
  ["⚙️", "Mechanism"], ["⚠️", "Safety Analysis"], ["🔄", "Interaction Check"], ["🧠", "Simple Explanation"],
];

function Pipeline() {
  return (
    <section className="rounded-3xl border border-border bg-soft-panel p-6 shadow-card">
      <h2 className="font-display text-2xl font-bold text-foreground">From Prescription → Understanding</h2>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PIPELINE.map(([icon, label], i) => (
          <li key={label} className="animate-fade-up relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl" aria-hidden="true">{icon}</span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-muted-foreground">Step {i + 1}</span>
              <span className="block font-bold text-foreground">{label}</span>
            </span>
            {i < PIPELINE.length - 1 ? <ArrowDown className="ml-auto size-4 text-primary lg:hidden" aria-hidden="true" /> : null}
            {i < PIPELINE.length - 1 && i % 4 !== 3 ? <ArrowRight className="ml-auto hidden size-4 text-primary lg:block" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Dashboard() {
  const { source, medicines } = useSession();
  const pairs = pairResults(medicines);
  const potential = pairs.filter((p) => p.kind === "found").length;
  const low = medicines.filter((m) => m.origin !== "manual" && confidenceLevel(m.confidence) === "low").length;
  const warnings = medicines.reduce((n, m) => n + (m.matchIds.length === 1 ? medicineInfo.get(m.matchIds[0]!)?.serious_warnings.length ?? 0 : 0), 0);
  const identified = medicines.filter((m) => m.matchIds.length === 1).length;

  const slots: Slot[] = ["Morning", "Afternoon", "Night", "As needed"];
  const unscheduled = medicines.filter((m) => !scheduleSlots(m.frequency));

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHeader eyebrow="Dashboard" title="Your Prescription" text="A safety overview of what RxLens read. It shows the schedule as written — it never changes it." />
      {source === "demo" ? <DemoLabel /> : null}

      {medicines.length === 0 ? (
        <EmptyState title="No prescription yet" text="Upload a prescription image or load the fictional demo to see your medicine safety dashboard." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Pill, "Medicines detected", medicines.length],
              [AlertTriangle, "Potential interactions", potential],
              [AlertTriangle, "Low-confidence reading", low],
              [Info, "Important warnings", warnings],
            ].map(([Icon, label, v]) => {
              const I = Icon as typeof Pill;
              return (
                <article key={label as string} className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <I className="size-6 text-primary" aria-hidden="true" />
                  <p className="mt-3 font-display text-4xl font-extrabold text-foreground">{v as number}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{label as string}</p>
                </article>
              );
            })}
          </div>

          <article className="flex flex-col gap-4 rounded-3xl border-2 border-warning bg-warning-soft p-6 sm:flex-row sm:items-center">
            <ShieldCheck className="size-10 shrink-0 text-warning-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-foreground">Verify before taking</h2>
              <p className="mt-1 leading-7 text-warning-foreground">Check every medicine, strength and instruction against the original prescription with your pharmacist or doctor.</p>
            </div>
            <Button asChild variant="hero"><Link to="/safety">Safety checklist</Link></Button>
          </article>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground">Medicine Timeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">Shown exactly as read from the prescription. Do not change it based on this view.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {slots.map((s) => {
                  const list = medicines.filter((m) => scheduleSlots(m.frequency)?.includes(s));
                  return (
                    <div key={s} className="rounded-2xl bg-surface p-4">
                      <p className="font-bold text-primary">{s}</p>
                      <ul className="mt-2 space-y-1 text-sm text-foreground">
                        {list.length ? list.map((m) => <li key={m.key}>{medLabel(m)}</li>) : <li className="text-muted-foreground">—</li>}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {unscheduled.length ? (
                <p className="mt-4 text-sm text-warning-foreground">⚠️ Schedule unclear for: {unscheduled.map(medLabel).join(", ")}. Please verify with your pharmacist/doctor.</p>
              ) : null}
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground">RxLens Safety Check</h2>
              <ul className="mt-4 space-y-3">
                <CheckRow ok>Prescription text {source === "demo" ? "loaded (demo)" : "extracted"}</CheckRow>
                <CheckRow ok={identified === medicines.length}>{identified} of {medicines.length} medicines identified in reference data</CheckRow>
                <CheckRow ok={identified > 0}>Drug information retrieved from prototype reference data</CheckRow>
                <CheckRow ok={low === 0}>{low === 0 ? "No low-confidence readings" : `${low} medicine${low > 1 ? "s have" : " has"} low reading confidence`}</CheckRow>
                <CheckRow ok={!pairs.some((p) => p.kind === "unknown")}>Interaction information checked{pairs.some((p) => p.kind === "unknown") ? " (some pairs unavailable)" : ""}</CheckRow>
              </ul>
              <div className="mt-5 grid gap-2 rounded-2xl bg-surface p-3 text-xs leading-5 text-muted-foreground">
                <p><b className="text-foreground">Reference information:</b> medicine facts come from the RxLens prototype reference dataset with cited sources.</p>
                <p><b className="text-foreground">AI-generated:</b> the text reading of uploaded images. It can be wrong.</p>
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-foreground">Detected medicines</h2>
              <Button asChild variant="clinical" size="sm"><Link to="/medicines">Open My Medicines</Link></Button>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {medicines.map((m) => (
                <li key={m.key} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-display text-lg font-bold text-foreground">{m.name ?? "???"} {m.strength ?? ""}</p>
                    <ConfidenceBadge value={m.confidence} manual={m.origin === "manual"} />
                  </div>
                  <MatchNote m={m} />
                  {m.matchIds.length === 1 ? (
                    <Link to="/medicine/$id" params={{ id: m.matchIds[0]! }} className="mt-2 inline-block text-sm font-bold text-primary hover:underline">View medicine profile →</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-2xl font-bold text-foreground">Prescription Interaction Map</h2>
            <div className="mt-4"><InteractionMap meds={medicines} /></div>
          </section>
        </>
      )}

      <Pipeline />
      <SafetyBanner />
    </section>
  );
}
