import { pairResults } from "@/components/rxlens/med-ui";
import { confidenceLevel, type FieldKey, type SessionMedicine } from "./medicine-session";

export type FieldState = "high" | "verify" | "unreadable" | "missing" | "user";

export const FIELD_LABEL: Record<FieldKey, string> = {
  name: "Medicine name", brand: "Brand name", generic: "Generic name", strength: "Strength", form: "Dosage form",
  frequency: "Frequency", duration: "Duration", instructions: "Special instructions",
};
export const CRITICAL: FieldKey[] = ["name", "strength", "frequency", "duration"];
export const COMPLETENESS: FieldKey[] = ["name", "strength", "form", "frequency", "duration", "instructions"];

export function fieldValue(m: SessionMedicine, f: FieldKey): string | null {
  return m[f] ?? null;
}

export function fieldState(m: SessionMedicine, f: FieldKey): FieldState {
  const v = fieldValue(m, f);
  if (!v) return "missing";
  if (m.origin === "manual") return "user";
  const lvl = confidenceLevel(m.conf[f] ?? null);
  return lvl === "high" ? "high" : lvl === "medium" ? "verify" : "unreadable";
}

export type VerifyItem = { med: SessionMedicine; field: FieldKey; value: string | null; conf: number | null; state: FieldState; reason: string };

function reasonFor(state: FieldState, f: FieldKey) {
  if (state === "missing") return `${FIELD_LABEL[f]} was not detected. RxLens will not fill it in.`;
  if (state === "unreadable") return `${FIELD_LABEL[f]} could not be read with enough confidence. RxLens will not treat this value as confirmed.`;
  return `${FIELD_LABEL[f]} requires verification. RxLens will not treat this value as confirmed.`;
}

export function verificationItems(meds: SessionMedicine[], fields: FieldKey[] = CRITICAL): VerifyItem[] {
  const out: VerifyItem[] = [];
  for (const m of meds) {
    if (m.origin === "manual") continue;
    for (const f of fields) {
      const s = fieldState(m, f);
      if (s === "verify" || s === "unreadable" || s === "missing") out.push({ med: m, field: f, value: fieldValue(m, f), conf: m.conf[f] ?? null, state: s, reason: reasonFor(s, f) });
    }
    if (m.name && (m.identity === "brand" || m.identity === "combination"))
      out.push({ med: m, field: "generic", value: m.generic, conf: null, state: "verify", reason: "Brand → generic is a possible match from a lookup list. Verify the medicine identity." });
  }
  return out;
}

export const identified = (m: SessionMedicine) => m.identity === "reference" && m.matchIds.length === 1;

export type Gate = { status: "SAFE TO DISPLAY EDUCATIONAL INFORMATION" | "REVIEW REQUIRED" | "INCOMPLETE CHECK"; reasons: string[]; interactionComplete: boolean };

export function safetyGate(meds: SessionMedicine[]): Gate {
  const reasons: string[] = [];
  const unidentified = meds.filter((m) => !identified(m) && m.origin !== "manual");
  const pairsUnknown = pairResults(meds).some((p) => p.kind === "unknown");
  const interactionComplete = meds.length > 0 && !pairsUnknown && unidentified.length === 0;
  if (!interactionComplete)
    reasons.push(`Interaction check incomplete because ${unidentified.length || "one or more"} medicine${unidentified.length === 1 ? " has" : "s have"} not been confidently identified.`);
  const items = verificationItems(meds);
  if (items.length) reasons.push(`${items.length} prescription detail${items.length === 1 ? "" : "s"} require${items.length === 1 ? "s" : ""} verification.`);
  const status = !interactionComplete ? "INCOMPLETE CHECK" : items.length ? "REVIEW REQUIRED" : "SAFE TO DISPLAY EDUCATIONAL INFORMATION";
  if (status.startsWith("SAFE")) reasons.push("All critical fields were read with high confidence and every medicine matched RxLens reference data. This only means educational information can be shown — it does not mean the medicines are safe for you.");
  return { status, reasons, interactionComplete };
}

export function humanTriggers(meds: SessionMedicine[]): string[] {
  const t: string[] = [];
  const items = verificationItems(meds);
  const has = (f: FieldKey) => items.some((i) => i.field === f);
  if (has("name")) t.push("Medicine name confidence is low");
  if (has("strength")) t.push("Strength is unclear or missing");
  if (has("frequency")) t.push("Frequency is unclear or missing");
  if (has("duration")) t.push("Duration is unclear or missing");
  if (new Set(items.map((i) => i.med.key)).size > 1) t.push("Multiple medicines are uncertain");
  if (!safetyGate(meds).interactionComplete) t.push("Interaction checking is incomplete");
  if (meds.some((m) => m.origin !== "manual" && !m.name)) t.push("Handwriting could not be confidently interpreted");
  return t;
}

/** Transparent overall score: plain average of available critical-field confidences + the lowest one. */
export function overallScore(meds: SessionMedicine[]) {
  const vals: { med: SessionMedicine; field: FieldKey; c: number | null }[] = [];
  for (const m of meds) if (m.origin !== "manual") for (const f of CRITICAL) vals.push({ med: m, field: f, c: fieldValue(m, f) ? (m.conf[f] ?? null) : null });
  const nums = vals.filter((v) => v.c != null) as { med: SessionMedicine; field: FieldKey; c: number }[];
  if (!vals.length) return null;
  const avg = nums.length ? Math.round(nums.reduce((s, v) => s + v.c, 0) / nums.length) : null;
  const lowest = [...vals].sort((a, b) => (a.c ?? -1) - (b.c ?? -1))[0]!;
  return { avg, counted: nums.length, total: vals.length, lowest };
}

export const STATE_STYLE: Record<FieldState, { cls: string; icon: string; label: string }> = {
  high: { cls: "bg-success/15 text-success border-success/30", icon: "✓", label: "Clearly detected" },
  verify: { cls: "bg-warning-soft text-warning-foreground border-warning/40", icon: "⚠", label: "Needs verification" },
  unreadable: { cls: "bg-danger-soft text-destructive border-destructive/30", icon: "✕", label: "Cannot confidently read" },
  missing: { cls: "bg-surface text-muted-foreground border-border", icon: "✕", label: "Not detected" },
  user: { cls: "bg-primary-soft text-primary border-primary/30", icon: "✎", label: "Entered by you" },
};
