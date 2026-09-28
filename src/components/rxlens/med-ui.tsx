import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ExternalLink, Info, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interactionsFor, medicineInfo, UNAVAILABLE } from "@/lib/medicine-data/provider";
import type { InteractionRecord, SourceRef } from "@/lib/medicine-data/types";
import { confidenceLevel, makeMedicine, session, type SessionMedicine } from "@/lib/medicine-session";
import { DEMO_LABEL } from "@/lib/rxlens-demo";

export function PageHeader({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-up">
      <p className="text-sm font-extrabold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-foreground sm:text-5xl">{title}</h1>
      {text ? <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{text}</p> : null}
      {children}
    </div>
  );
}

export function DemoLabel() {
  return (
    <p className="rounded-2xl border border-destructive/30 bg-danger-soft p-3 text-center text-sm font-extrabold uppercase tracking-widest text-destructive">
      {DEMO_LABEL}
    </p>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-dashed border-primary/35 bg-card p-8 text-center shadow-card">
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="hero"><Link to="/analyze">Upload Prescription</Link></Button>
        <Button type="button" variant="clinical" onClick={loadDemo}>Load demo prescription</Button>
      </div>
    </article>
  );
}

export async function loadDemo() {
  const { demoMedicineLines } = await import("@/lib/rxlens-demo");
  session.setPrescription("demo", demoMedicineLines.map((l) => makeMedicine({ ...l, origin: "demo" })));
}

export function ConfidenceBadge({ value, manual = false }: { value: number | null; manual?: boolean }) {
  if (manual) return <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted-foreground">Entered manually</span>;
  const lvl = confidenceLevel(value);
  const cls = { high: "bg-success/15 text-success", medium: "bg-warning-soft text-warning-foreground", low: "bg-danger-soft text-destructive" }[lvl];
  const dot = { high: "🟢", medium: "🟡", low: "🔴" }[lvl];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {dot} {value == null ? "Confidence unavailable" : `${Math.round(value)}%`} · {lvl}
    </span>
  );
}

export function Sources({ sources, date }: { sources: SourceRef[]; date: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-3 text-xs leading-5 text-muted-foreground">
      <p className="font-bold text-foreground">Source / reference information</p>
      <ul className="mt-1 space-y-0.5">
        {sources.map((s) => (
          <li key={s.name}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                {s.name} <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ) : s.name}
          </li>
        ))}
      </ul>
      <p className="mt-1">Last reviewed: {date}</p>
    </div>
  );
}

export function medLabel(m: SessionMedicine) {
  return [m.name ?? "Unclear medicine", m.strength].filter(Boolean).join(" ");
}

export type PairResult =
  | { kind: "found"; a: SessionMedicine; b: SessionMedicine; rec: InteractionRecord }
  | { kind: "none"; a: SessionMedicine; b: SessionMedicine }
  | { kind: "unknown"; a: SessionMedicine; b: SessionMedicine };

export function pairResults(meds: SessionMedicine[]): PairResult[] {
  const out: PairResult[] = [];
  for (let i = 0; i < meds.length; i++)
    for (let j = i + 1; j < meds.length; j++) {
      const a = meds[i], b = meds[j];
      if (a.matchIds.length !== 1 || b.matchIds.length !== 1) out.push({ kind: "unknown", a, b });
      else {
        const rec = medicineInfo.interaction(a.matchIds[0], b.matchIds[0]);
        out.push(rec ? { kind: "found", a, b, rec } : { kind: "none", a, b });
      }
    }
  return out;
}

const sevStyle = {
  major: { dot: "🔴", label: "Major potential interaction", cls: "border-destructive/40 bg-danger-soft" },
  moderate: { dot: "🟠", label: "Potential interaction", cls: "border-warning/50 bg-warning-soft" },
  minor: { dot: "🟡", label: "Minor potential interaction", cls: "border-warning/30 bg-warning-soft/60" },
};

export function InteractionMap({ meds }: { meds: SessionMedicine[] }) {
  const pairs = pairResults(meds);
  const [open, setOpen] = useState<number | null>(null);
  if (meds.length < 2)
    return <p className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">Add at least two medicines to compare them.</p>;
  return (
    <ul className="grid gap-3">
      {pairs.map((p, i) => {
        const title = `${medLabel(p.a)} ↔ ${medLabel(p.b)}`;
        if (p.kind === "unknown")
          return (
            <li key={i} className="rounded-2xl border border-border bg-surface p-4">
              <p className="font-bold text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">⚪ Interaction information unavailable — one medicine could not be confidently identified. Verify with a pharmacist.</p>
            </li>
          );
        if (p.kind === "none")
          return (
            <li key={i} className="rounded-2xl border border-success/30 bg-card p-4">
              <p className="font-bold text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">🟢 No known major interaction identified in RxLens reference data. This does not guarantee there is none.</p>
            </li>
          );
        const s = sevStyle[p.rec.severity];
        return (
          <li key={i} className={`rounded-2xl border p-4 ${s.cls}`}>
            <button type="button" className="w-full text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <p className="font-bold text-foreground">{title}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{s.dot} {s.label} · <span className="underline">{open === i ? "Hide details" : "Tap to understand"}</span></p>
            </button>
            {open === i ? (
              <div className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                <p><b>Interaction type:</b> {p.rec.interaction_type}</p>
                <p><b>Why it may matter:</b> {p.rec.interaction_description}</p>
                <p><b>Possible clinical concern:</b> {p.rec.clinical_concern}</p>
                <p className="rounded-xl bg-card p-3 font-bold">Recommended action: Discuss with your doctor/pharmacist. Do not stop or change any medicine on your own.</p>
                <Sources sources={p.rec.sources} date={p.rec.last_verified_date} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function AddMedicineForm() {
  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return setMsg("Please enter a medicine name.");
        const m = makeMedicine({ name: name.trim(), strength: strength.trim() || null, form: null, frequency: null, duration: null, instructions: null, confidence: null, origin: "manual" });
        session.add(m);
        setMsg(
          m.matchIds.length === 0
            ? `Added. "${name.trim()}" isn't in RxLens reference data, so no information or interaction check is available for it.`
            : m.matchIds.length > 1 ? "Added. This name matches more than one medicine — please verify with a pharmacist." : "Added and checked against the other medicines.",
        );
        setName("");
        setStrength("");
      }}
    >
      <label className="sr-only" htmlFor="add-med">Medicine name</label>
      <Input id="add-med" placeholder="+ Add another medicine (e.g. Ibuprofen)" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
      <label className="sr-only" htmlFor="add-str">Strength (optional)</label>
      <Input id="add-str" placeholder="Strength (optional)" value={strength} onChange={(e) => setStrength(e.target.value)} className="h-12" />
      <Button type="submit" variant="hero"><Plus aria-hidden="true" />Add</Button>
      {msg ? <p role="status" className="text-sm text-muted-foreground sm:col-span-3">{msg}</p> : null}
    </form>
  );
}

export function MatchNote({ m }: { m: SessionMedicine }) {
  if (!m.name || (m.origin !== "manual" && confidenceLevel(m.confidence) === "low"))
    return <Warn>⚠️ Medicine name may be unclear. Please verify this medicine name before relying on the information shown.</Warn>;
  if (m.matchIds.length === 0) return <Warn>RxLens could not confidently identify this medicine. Please enter the medicine name manually or verify with a pharmacist.</Warn>;
  if (m.matchIds.length > 1) return <Warn>This name matches more than one medicine ({m.matchIds.join(", ")}). Please verify with a pharmacist.</Warn>;
  return null;
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex gap-2 rounded-2xl border border-warning/40 bg-warning-soft p-3 text-sm leading-6 text-warning-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Unavailable() {
  return <p className="flex gap-2 text-sm text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{UNAVAILABLE}</p>;
}

export function CheckRow({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm font-semibold text-foreground">
      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden="true" />}
      {children}
    </li>
  );
}

export { interactionsFor };
