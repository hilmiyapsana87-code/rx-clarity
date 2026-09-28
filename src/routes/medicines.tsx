import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { AddMedicineForm, ConfidenceBadge, DemoLabel, EmptyState, MatchNote, PageHeader, Warn } from "@/components/rxlens/med-ui";
import { decodeInstruction } from "@/lib/instruction-decoder";
import { medicineInfo } from "@/lib/medicine-data/provider";
import { session, useSession } from "@/lib/medicine-session";

export const Route = createFileRoute("/medicines")({
  head: () => ({
    meta: [
      { title: "My Medicines — RxLens" },
      { name: "description", content: "Your detected medicines with reading confidence and plain-language prescription explanations." },
      { property: "og:title", content: "My Medicines — RxLens" },
      { property: "og:description", content: "Explain My Prescription: abbreviations like BID and PC turned into simple language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyMedicines,
});

function MyMedicines() {
  const { source, medicines } = useSession();
  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PageHeader eyebrow="My Medicines" title="Explain My Prescription" text="Prescription shorthand explained in plain language. RxLens explains the instruction — it never modifies it." />
      {source === "demo" ? <DemoLabel /> : null}
      {medicines.length === 0 ? (
        <EmptyState title="No medicines yet" text="Upload a prescription, load the demo, or add a medicine below." />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {medicines.map((m) => {
            const ref = m.matchIds.length === 1 ? medicineInfo.get(m.matchIds[0]!) : null;
            const dec = decodeInstruction(m.instructions ?? m.frequency);
            const uncertain = m.origin !== "manual" && (m.confidence == null || m.confidence < 70);
            return (
              <li key={m.key} className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-2xl font-bold text-foreground">{m.name ?? "???"} {m.strength ?? ""}</h2>
                    <p className="text-sm text-muted-foreground">{ref ? ref.therapeutic_class : "Category unavailable"}</p>
                  </div>
                  <ConfidenceBadge value={m.confidence} manual={m.origin === "manual"} />
                </div>
                <MatchNote m={m} />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[["Strength", m.strength], ["Form", m.form], ["Frequency", m.frequency], ["Duration", m.duration]].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-surface p-3">
                      <dt className="font-bold text-muted-foreground">{k}</dt>
                      <dd className="mt-1 break-words text-foreground">{v ?? (k === "Strength" ? "Missing strength — verify" : k === "Frequency" ? "Missing dosage — verify" : "Not found")}</dd>
                    </div>
                  ))}
                </dl>
                {m.instructions || m.frequency ? (
                  <div className="mt-4 rounded-2xl bg-primary-soft p-4 text-sm leading-6">
                    <p className="font-bold text-primary">Original</p>
                    <p className="font-mono text-foreground">“{m.instructions ?? m.frequency}”</p>
                    <p className="mt-2 font-bold text-primary">Explanation</p>
                    {uncertain || !dec.explanation ? (
                      <p className="text-warning-foreground">⚠️ This instruction could not be read confidently. Please verify it with your pharmacist/doctor.</p>
                    ) : (
                      <p className="text-foreground">{dec.explanation}</p>
                    )}
                    {dec.unknown.length && !uncertain ? <p className="mt-1 text-xs text-muted-foreground">Not recognised: {dec.unknown.join(", ")} — ask your pharmacist.</p> : null}
                  </div>
                ) : m.origin !== "manual" ? <Warn>No instruction found. Please check the original prescription.</Warn> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {ref ? <Button asChild variant="clinical" size="sm"><Link to="/medicine/$id" params={{ id: ref.medicine_id }}>View profile</Link></Button> : null}
                  <Button type="button" variant="ghost" size="sm" onClick={() => session.remove(m.key)} aria-label={`Remove ${m.name ?? "medicine"} from this list`}>
                    <Trash2 aria-hidden="true" /> Remove from list
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-foreground">Add a medicine manually</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Useful if RxLens couldn't read a name, or to check a medicine not on this prescription.</p>
        <AddMedicineForm />
      </article>
      <SafetyBanner />
    </section>
  );
}
