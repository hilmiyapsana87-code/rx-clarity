import { useSyncExternalStore } from "react";
import { brandLookup } from "./brand-map";
import type { Slot } from "./instruction-decoder";
import { medicineInfo } from "./medicine-data/provider";

// In-memory only. Nothing is saved to storage; refreshing the page clears it.

export type SessionOrigin = "demo" | "upload" | "manual";
export type FieldKey = "name" | "brand" | "generic" | "strength" | "form" | "frequency" | "duration" | "instructions";

export type SessionMedicine = {
  key: string;
  name: string | null;
  brand: string | null;
  generic: string | null;
  strength: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  confidence: number | null; // name-reading confidence
  conf: Partial<Record<FieldKey, number | null>>; // per-field reading confidence
  origin: SessionOrigin;
  matchIds: string[]; // reference matches; >1 = ambiguous, 0 = unknown
  identity: "reference" | "brand" | "combination" | "ambiguous" | "none";
};

export type Region = { label: string; x: number; y: number; w: number; h: number; confidence: number | null; reason: string };
export type ReadStatus = "clear" | "partial" | "blurry" | "unreadable" | "not_prescription" | null;

type State = {
  source: "demo" | "upload" | null;
  scenario: string | null;
  status: ReadStatus;
  image: string | null; // uploaded image data URL, memory only
  regions: Region[];
  medicines: SessionMedicine[];
  confirmed: Record<string, Slot[]>; // user-confirmed schedule per medicine key
};

const empty: State = { source: null, scenario: null, status: null, image: null, regions: [], medicines: [], confirmed: {} };
let state: State = empty;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const LOW = 60;
export const MEDIUM = 85;

export function confidenceLevel(c: number | null | undefined): "high" | "medium" | "low" {
  if (c == null || c < LOW) return "low";
  return c < MEDIUM ? "medium" : "high";
}

export type MedInput = {
  name: string | null;
  strength: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  confidence: number | null;
  origin: SessionOrigin;
  brand?: string | null;
  generic?: string | null;
  conf?: Partial<Record<FieldKey, number | null>>;
};

let n = 0;
export function makeMedicine(p: MedInput): SessionMedicine {
  const nameConf = p.conf?.name ?? p.confidence;
  const lowName = p.origin !== "manual" && confidenceLevel(nameConf) === "low";
  let matchIds: string[] = [];
  let identity: SessionMedicine["identity"] = "none";
  let brand = p.brand ?? null;
  let generic = p.generic ?? null;
  const conf: SessionMedicine["conf"] = p.conf ?? {
    name: p.confidence, strength: p.confidence, form: p.confidence, frequency: p.confidence, duration: p.confidence, instructions: p.confidence,
  };
  if (p.name && !lowName) {
    const lookup = generic ?? p.name;
    matchIds = medicineInfo.match(lookup).map((m) => m.medicine_id);
    if (matchIds.length === 1) identity = "reference";
    else if (matchIds.length > 1) identity = "ambiguous";
    else {
      const b = brandLookup(p.name);
      if (b) {
        brand = brand ?? p.name;
        generic = b.ingredients.join(" + ");
        conf.generic = null; // mapping is a lookup, not a reading
        if (b.ingredients.length === 1) {
          const ids = medicineInfo.match(b.ingredients[0]!).map((m) => m.medicine_id);
          if (ids.length === 1) matchIds = ids;
          identity = "brand";
        } else identity = "combination";
      }
    }
  }
  return { ...p, brand, generic, conf, key: `m${++n}`, matchIds, identity };
}

export const session = {
  get: () => state,
  setPrescription(source: "demo" | "upload", medicines: SessionMedicine[], extra: Partial<Pick<State, "scenario" | "status" | "image" | "regions">> = {}) {
    state = { ...empty, source, medicines, ...extra };
    emit();
  },
  add(m: SessionMedicine) {
    state = { ...state, medicines: [...state.medicines, m] };
    emit();
  },
  remove(key: string) {
    const { [key]: _, ...confirmed } = state.confirmed;
    state = { ...state, medicines: state.medicines.filter((m) => m.key !== key), confirmed };
    emit();
  },
  confirm(key: string, slots: Slot[] | null) {
    const confirmed = { ...state.confirmed };
    if (slots) confirmed[key] = slots;
    else delete confirmed[key];
    state = { ...state, confirmed };
    emit();
  },
  clear() {
    state = empty;
    emit();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSession() {
  return useSyncExternalStore(subscribe, () => state, () => empty);
}
