import { useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion, UserCheck } from "lucide-react";

import type { SessionMedicine } from "@/lib/medicine-session";
import {
  COMPLETENESS,
  FIELD_LABEL,
  STATE_STYLE,
  fieldState,
  fieldValue,
  humanTriggers,
  overallScore,
  safetyGate,
  verificationItems,
} from "@/lib/safety-logic";

const medName = (m: SessionMedicine, i: number) => m.name ?? `Unreadable medicine ${i + 1}`;

/** Confidence + safety core: Safety Gate, Uncertainty Shield, Completeness, Human Verification. */
export function SafetyReview({ meds }: { meds: SessionMedicine[] }) {
  const gate = safetyGate(meds);
  const items = verificationItems(meds);
  const triggers = humanTriggers(meds);
  const score = overallScore(meds);
  const [why, setWhy] = useState(false);

  const gateStyle =
    gate.status === "INCOMPLETE CHECK"
      ? { cls: "border-destructive/40 bg-danger-soft", text: "text-destructive", Icon: ShieldQuestion, label: "Incomplete Check" }
      : gate.status === "REVIEW REQUIRED"
        ? { cls: "border-warning/40 bg-warning-soft", text: "text-warning-foreground", Icon: ShieldAlert, label: "Review Required" }
        : { cls: "border-primary/30 bg-primary-soft", text: "text-primary", Icon: ShieldCheck, label: "Educational information OK" };

  return (
    <div className="space-y-6">
      <article className={`rounded-3xl border p-6 shadow-card ${gateStyle.cls}`} aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <gateStyle.Icon className={`mt-1 size-7 shrink-0 ${gateStyle.text}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Safety Gate</p>
              <h3 className={`font-display text-2xl font-bold ${gateStyle.text}`}>{gateStyle.label}</h3>
            </div>
          </div>
          <button type="button" onClick={() => setWhy((v) => !v)} className="rounded-full border border-border bg-card px-3 py-1 text-sm font-bold text-foreground hover:bg-surface" aria-expanded={why}>
            Why?
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">
          {gate.interactionComplete ? "Interaction check completed against RxLens reference data." : "Interaction check incomplete — RxLens cannot say there is “no interaction”."}
        </p>
        {why ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
            {gate.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">Green never means “safe to take”. It only means a value was read clearly.</p>
      </article>

      {score ? (
        <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">How the score is calculated</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {score.avg != null ? <>Average of {score.counted} of {score.total} critical-field readings: <b>{score.avg}%</b>.</> : "No critical field could be scored."}{" "}
            Lowest critical field: <b>{FIELD_LABEL[score.lowest.field]}</b> of {score.lowest.med.name ?? "an unreadable medicine"} —{" "}
            <b>{score.lowest.c != null ? `${Math.round(score.lowest.c)}%` : "not detected"}</b>.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Reading confidence only — not medical certainty.</p>
        </article>
      ) : null}

      <article className="rounded-3xl border border-warning/40 bg-card p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-widest text-warning-foreground">Uncertainty Shield</p>
        <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
          {items.length ? `${items.length} detail${items.length === 1 ? "" : "s"} require${items.length === 1 ? "s" : ""} verification` : "No low-confidence critical fields"}
        </h3>
        {items.length ? (
          <ul className="mt-4 grid gap-3">
            {items.map((it, i) => {
              const st = STATE_STYLE[it.state];
              return (
                <li key={i} className="rounded-2xl border border-border bg-surface p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground">{it.med.name ?? "Unreadable medicine"} · {FIELD_LABEL[it.field]}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${st.cls}`}>{st.icon} {st.label}{it.conf != null ? ` · ${Math.round(it.conf)}%` : ""}</span>
                  </div>
                  <p className="mt-1 text-foreground">Possible reading: {it.value ?? "—"}</p>
                  <p className="mt-1 text-muted-foreground">{it.reason}</p>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-warning-foreground">RxLens couldn't confidently read these parts. Please verify them with your doctor or pharmacist.</p>
      </article>

      <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Prescription Completeness</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {meds.map((m, i) => (
            <div key={m.key} className="min-w-0 rounded-2xl bg-surface p-4">
              <p className="truncate font-bold text-foreground">{medName(m, i)}</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {COMPLETENESS.map((f) => {
                  const s = fieldState(m, f);
                  const st = STATE_STYLE[s];
                  return (
                    <li key={f} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2">
                      <span className={`grid size-5 place-items-center rounded-full border text-[11px] font-bold ${st.cls}`} aria-hidden="true">{st.icon}</span>
                      <span className="truncate text-foreground">{FIELD_LABEL[f]}: <span className="text-muted-foreground">{fieldValue(m, f) ?? "not detected"}</span></span>
                      <span className="text-xs text-muted-foreground">{st.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </article>

      {triggers.length ? (
        <article className="rounded-3xl border border-destructive/30 bg-danger-soft p-6 shadow-card">
          <div className="flex gap-3">
            <UserCheck className="mt-1 size-6 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Human Verification Required</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
                {triggers.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p className="mt-3 text-sm font-semibold text-destructive">Show this prescription to your doctor or pharmacist before taking or changing any medication.</p>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
