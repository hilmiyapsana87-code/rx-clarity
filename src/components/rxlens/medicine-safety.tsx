import { useState } from "react";
import { Info, Stethoscope, Volume2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { medicineInfo } from "@/lib/medicine-data/provider";
import type { InteractionRecord, MedicineRecord } from "@/lib/medicine-data/types";
import { Sources } from "./med-ui";

// Structured view of one medicine. Prescription fields come ONLY from the
// reading (or the fictional demo); general fields come ONLY from reference data.
export type MedicineView = {
  medicineName: string | null;
  genericName: string | null;
  brandName: string | null;
  strength: string | null;
  dosageForm: string | null;
  activeIngredient: string[] | null;
  inactiveIngredients: string | null;
  mechanism: string | null;
  commonUses: string[] | null;
  commonSideEffects: string[] | null;
  seriousWarnings: string[] | null;
  drugInteractions: { other: string; rec: InteractionRecord }[] | null;
  foodInteractions: string[] | null;
  conditionWarnings: string[] | null;
  whatToExpect: string | null;
  redFlags: string[] | null;
  ocrConfidence: number | null;
  ocrConfidenceLevel: "high" | "medium" | "low";
  prescriptionFrequency: string | null;
  prescriptionDuration: string | null;
  verificationRequired: boolean;
  sourceType: "ocr" | "demo";
};

export type ReadLine = {
  name: string | null;
  strength: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  confidence: number | null;
};

export const levelOf = (c: number | null) => (c == null || c < 70 ? "low" : c < 85 ? "medium" : "high");

/** Only matches the reference when the name was read confidently and matches exactly one record. */
export function referenceFor(line: ReadLine): MedicineRecord | null {
  if (!line.name || levelOf(line.confidence) === "low") return null;
  const hits = medicineInfo.match(line.name);
  return hits.length === 1 ? hits[0]! : null;
}

export function buildView(line: ReadLine, peers: ReadLine[], sourceType: "ocr" | "demo"): MedicineView {
  const ref = referenceFor(line);
  const peerRefs = peers.filter((p) => p !== line).map(referenceFor).filter(Boolean) as MedicineRecord[];
  return {
    medicineName: line.name,
    genericName: ref?.generic_name ?? null,
    brandName: null, // brand is never inferred — only what the prescription says
    strength: line.strength,
    dosageForm: line.form,
    activeIngredient: ref?.active_ingredients ?? null,
    inactiveIngredients: ref?.inactive_ingredients ?? null,
    mechanism: ref?.mechanism.simple ?? null,
    commonUses: ref?.indications ?? null,
    commonSideEffects: ref?.common_side_effects ?? null,
    seriousWarnings: ref?.important_side_effects ?? null,
    drugInteractions: ref
      ? peerRefs.flatMap((p) => {
          const rec = medicineInfo.interaction(ref.medicine_id, p.medicine_id);
          return rec ? [{ other: p.generic_name, rec }] : [];
        })
      : null,
    foodInteractions: ref ? [...ref.food_interactions, ...(ref.alcohol ? [`Alcohol: ${ref.alcohol}`] : [])] : null,
    conditionWarnings: ref?.condition_warnings ?? null,
    whatToExpect: ref ? [ref.onset_information, ref.duration_information].filter(Boolean).join(" ") || null : null,
    redFlags: ref?.serious_warnings ?? null,
    ocrConfidence: line.confidence,
    ocrConfidenceLevel: levelOf(line.confidence),
    prescriptionFrequency: line.frequency,
    prescriptionDuration: line.duration,
    verificationRequired: levelOf(line.confidence) === "low" || !line.name,
    sourceType,
  };
}

const NV = "Needs verification";

export function PrescriptionSummaryTable({ lines, demo }: { lines: ReadLine[]; demo: boolean }) {
  const cell = (v: string | null, c: number | null) =>
    v && levelOf(c) !== "low" ? v : <span className="font-semibold text-warning-foreground">{v ? `${v} — ${NV}` : NV}</span>;
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-bold text-foreground">📋 Prescription Summary</h2>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-foreground">
          {demo ? "Demo information — fictional" : "📋 Extracted from prescription"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Only what was read from the image. Nothing here is general medicine information.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-muted-foreground">
            <tr>{["Medicine", "Strength", "Frequency", "Duration"].map((h) => <th key={h} scope="col" className="border-b border-border py-2 pr-3 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 font-bold text-foreground">{cell(l.name, l.confidence)}</td>
                <td className="py-2 pr-3">{cell(l.strength, l.confidence)}</td>
                <td className="py-2 pr-3">{cell(l.frequency, l.confidence)}</td>
                <td className="py-2 pr-3">{cell(l.duration, l.confidence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function EducationalBanner() {
  return (
    <p className="flex gap-2 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm leading-6 text-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span><b>RxLens is an educational assistant.</b> It helps interpret prescription information and provides general medicine information. It does not diagnose, prescribe, or replace a doctor or pharmacist.</span>
    </p>
  );
}

export const CONFIDENCE_NOTE =
  "This confidence score represents the app's reading confidence. It does not confirm that the medicine or prescription is medically correct.";

function L({ items, empty }: { items: string[] | null; empty: string }) {
  return items && items.length ? (
    <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
  ) : (
    <p className="text-muted-foreground">{empty}</p>
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

/** Collapsible general information + verify footer for one medicine card. */
export function MedicineSafetySections({ view, demo }: { view: MedicineView; demo: boolean }) {
  const [verifyOpen, setVerifyOpen] = useState(false);
  const ref = view.genericName ? medicineInfo.match(view.genericName)[0] ?? null : null;
  const noRef = "Not available — the medicine could not be confidently identified in RxLens reference data.";
  const tag = demo ? "Demo information" : "📚 General Medicine Information";

  const sections: [string, React.ReactNode][] = [
    ["💊 Medicine Identity", (
      <dl className="grid gap-1">
        <div><dt className="inline font-bold">Generic name: </dt><dd className="inline">{view.genericName ?? "Not identified"}</dd></div>
        <div><dt className="inline font-bold">Brand: </dt><dd className="inline">{view.brandName ?? "Not identified from the prescription"}</dd></div>
        <div><dt className="inline font-bold">Strength: </dt><dd className="inline">{view.strength ?? "Not identified from the prescription"}</dd></div>
        <div><dt className="inline font-bold">Form: </dt><dd className="inline">{view.dosageForm ?? "Not identified from the prescription"}</dd></div>
      </dl>
    )],
    ["🧪 What's Inside?", view.activeIngredient ? (
      <><p><b>Active ingredient:</b> {view.activeIngredient.join(", ")}</p><p className="mt-1"><b>Inactive ingredients:</b> {view.inactiveIngredients ?? "Inactive ingredients were not identified."}</p></>
    ) : <p className="text-muted-foreground">{noRef}</p>],
    ["⚙️ How It Works", <p>{view.mechanism ?? noRef}</p>],
    ["🎯 Why Is It Used?", <><p className="font-semibold">This medicine is commonly used for:</p><L items={view.commonUses} empty={noRef} /><p className="mt-2 text-muted-foreground">Only your healthcare professional can confirm why it was prescribed for you.</p></>],
    ["⚠️ Side-Effect Radar", <><p className="font-bold">Common</p><L items={view.commonSideEffects} empty={noRef} /><p className="mt-3 font-bold">Important / Serious</p><L items={view.seriousWarnings} empty={noRef} /><p className="mt-3 text-muted-foreground">Not everyone gets these. Not all side effects are listed. Consult a healthcare professional or official medicine information for complete details.</p></>],
    ["🔄 Drug–Drug Interactions", view.drugInteractions == null ? (
      <p className="text-muted-foreground">Interaction checking is unavailable for this medicine.</p>
    ) : view.drugInteractions.length ? (
      <ul className="space-y-3">{view.drugInteractions.map(({ other, rec }) => (
        <li key={other} className="rounded-xl bg-warning-soft p-3"><p className="font-bold">{view.genericName} + {other} ({rec.severity})</p><p>Potential interaction: {rec.interaction_description}</p><p className="font-semibold">Action: Discuss with your doctor/pharmacist.</p></li>
      ))}</ul>
    ) : <p>No major interaction identified within the medicines currently analyzed. This does not mean no interaction exists.</p>],
    ["🍊 Food & Beverage", view.foodInteractions == null ? <p className="text-muted-foreground">{noRef}</p> : <L items={view.foodInteractions} empty="No specific food or beverage interaction identified." />],
    ["🩺 Condition Precautions", view.conditionWarnings?.length ? <p>Tell your healthcare professional if you have: {view.conditionWarnings.join(", ")}.</p> : <p className="text-muted-foreground">{noRef}</p>],
    ["⏱️ What To Expect", <><p>{view.whatToExpect ?? noRef}</p><p className="mt-2 text-muted-foreground">How quickly this medicine works can vary depending on the medicine, condition, and individual.</p></>],
    ["🚨 When To Seek Help", <><L items={view.redFlags} empty={noRef} /><p className="mt-2 font-semibold">If you experience severe or concerning symptoms, seek medical attention.</p></>],
  ];

  const readText = ref
    ? `${ref.generic_name}. ${ref.mechanism.simple} This medicine is commonly used for ${ref.indications.join(", ")}. Only your healthcare professional can confirm why it was prescribed for you.`
    : "General information is not available because this medicine could not be confidently identified. Please verify with your doctor or pharmacist.";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{tag}</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => speak(readText)} aria-label={`Read aloud information about ${view.medicineName ?? "this medicine"}`}>
          <Volume2 aria-hidden="true" /> 🔊 Read Aloud
        </Button>
      </div>
      <Accordion type="multiple" className="mt-2 rounded-2xl border border-border bg-surface/50 px-4">
        {sections.map(([t, c]) => (
          <AccordionItem key={t} value={t}>
            <AccordionTrigger className="text-left font-display text-base font-bold">{t}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-foreground">{c}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {ref ? <Sources sources={ref.sources} date={ref.last_verified_date} /> : null}
      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="font-bold text-foreground">👨‍⚕️ Verify With a Healthcare Professional</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">RxLens provides educational information and helps interpret prescription text. It does not replace a doctor or pharmacist.</p>
        <Button type="button" variant="clinical" size="sm" className="mt-3" aria-expanded={verifyOpen} onClick={() => setVerifyOpen((v) => !v)}>
          <Stethoscope aria-hidden="true" /> Verify With Doctor / Pharmacist
        </Button>
        {verifyOpen ? (
          <p role="status" className="mt-3 rounded-xl bg-primary-soft p-3 text-sm leading-6 text-foreground">
            Bring this prescription to your pharmacist or contact the doctor who wrote it. Ask them to confirm the medicine name, strength, how often to take it and for how long. Always follow their instructions.
          </p>
        ) : null}
      </div>
    </div>
  );
}
