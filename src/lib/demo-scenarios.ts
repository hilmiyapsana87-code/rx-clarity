// FICTIONAL DEMONSTRATION DATA ONLY. Never used for real uploads.
// All confidence numbers below are demonstration values, not real readings.
import { makeMedicine, session, type MedInput, type Region } from "./medicine-session";

type DemoLine = Omit<MedInput, "origin" | "confidence"> & { conf: NonNullable<MedInput["conf"]>; raw: string; reason: string };

export type Scenario = { id: "clear" | "messy" | "unreadable"; title: string; text: string; status: "clear" | "partial" | "unreadable"; lines: DemoLine[] };

const L = (raw: string, reason: string, d: Omit<DemoLine, "raw" | "reason">): DemoLine => ({ raw, reason, ...d });

export const SCENARIOS: Scenario[] = [
  {
    id: "clear", title: "Clear prescription", text: "Typed text, high confidence on every field.", status: "clear",
    lines: [
      L("Tab Metformin 500 mg  1-0-1  x 30 days  after food", "Printed text, clearly legible.", { name: "Metformin", strength: "500 mg", form: "Tablet", frequency: "1-0-1", duration: "30 days", instructions: "After food", conf: { name: 97, strength: 95, form: 94, frequency: 93, duration: 92, instructions: 90 } }),
      L("Tab Atorvastatin 10 mg  0-0-1  x 30 days", "Printed text, clearly legible.", { name: "Atorvastatin", strength: "10 mg", form: "Tablet", frequency: "0-0-1", duration: "30 days", instructions: "At night", conf: { name: 96, strength: 94, form: 92, frequency: 91, duration: 90, instructions: 88 } }),
    ],
  },
  {
    id: "messy", title: "Messy handwriting", text: "Partial confidence — RxLens flags what needs verification.", status: "partial",
    lines: [
      L("Augmentin 625  1 tab BD  ...", "Brand name readable; frequency strokes overlap.", { name: "Augmentin", strength: "625 mg", form: "Tablet", frequency: "BD", duration: null, instructions: null, conf: { name: 88, strength: 86, form: 80, frequency: 48, duration: null, instructions: null } }),
      L("Tab Warfarin 5 mg  OD HS", "Mostly legible handwriting.", { name: "Warfarin", strength: "5 mg", form: "Tablet", frequency: "OD HS", duration: "As directed", instructions: "At bedtime", conf: { name: 92, strength: 90, form: 88, frequency: 86, duration: 72, instructions: 85 } }),
      L("Paracetamol 500  SOS", "Legible; no duration written.", { name: "Paracetamol", strength: "500 mg", form: "Tablet", frequency: "SOS", duration: null, instructions: null, conf: { name: 91, strength: 89, form: null, frequency: 87, duration: null, instructions: null } }),
      L("?? 20 mg BD", "Medicine name is an unreadable scribble.", { name: null, strength: "20 mg", form: null, frequency: "BD", duration: null, instructions: null, conf: { name: 21, strength: 66, form: null, frequency: 62, duration: null, instructions: null } }),
    ],
  },
  {
    id: "unreadable", title: "Unreadable prescription", text: "RxLens refuses to guess.", status: "unreadable",
    lines: [
      L("~~~~ ~~ ~~~", "Strokes cannot be separated into letters.", { name: null, strength: null, form: null, frequency: null, duration: null, instructions: null, conf: { name: 18, strength: null, frequency: null, duration: null } }),
      L("~~ ~~~~ 1-?-1", "Only a partial number pattern is visible.", { name: null, strength: null, form: null, frequency: null, duration: null, instructions: null, conf: { name: 14, strength: null, frequency: 31, duration: null } }),
    ],
  },
];

export function loadScenario(id: Scenario["id"]) {
  const sc = SCENARIOS.find((s) => s.id === id)!;
  const meds = sc.lines.map((l) => makeMedicine({ ...l, confidence: l.conf.name ?? null, origin: "demo" }));
  const regions: Region[] = sc.lines.map((l, i) => {
    const vals = Object.values(l.conf).filter((v): v is number => v != null);
    return { label: l.raw, x: 6, y: 22 + i * 17, w: 88, h: 12, confidence: vals.length ? Math.min(...vals) : null, reason: l.reason };
  });
  session.setPrescription("demo", meds, { scenario: id, status: sc.status, regions });
}
