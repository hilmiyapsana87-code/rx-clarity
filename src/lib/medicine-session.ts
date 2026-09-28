import { useSyncExternalStore } from "react";
import { medicineInfo } from "./medicine-data/provider";

// In-memory only. Nothing is saved to storage; refreshing the page clears it.

export type SessionOrigin = "demo" | "upload" | "manual";

export type SessionMedicine = {
  key: string;
  name: string | null;
  strength: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  confidence: number | null;
  origin: SessionOrigin;
  matchIds: string[]; // reference matches; >1 = ambiguous, 0 = unknown
};

type State = { source: "demo" | "upload" | null; medicines: SessionMedicine[] };

let state: State = { source: null, medicines: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const LOW = 70;
export const MEDIUM = 85;

export function confidenceLevel(c: number | null): "high" | "medium" | "low" {
  if (c == null || c < LOW) return "low";
  return c < MEDIUM ? "medium" : "high";
}

let n = 0;
export function makeMedicine(p: Omit<SessionMedicine, "key" | "matchIds">): SessionMedicine {
  const lowName = p.origin !== "manual" && confidenceLevel(p.confidence) === "low";
  const matchIds = p.name && !lowName ? medicineInfo.match(p.name).map((m) => m.medicine_id) : [];
  return { ...p, key: `m${++n}`, matchIds };
}

export const session = {
  get: () => state,
  setPrescription(source: "demo" | "upload", medicines: SessionMedicine[]) {
    state = { source, medicines };
    emit();
  },
  add(m: SessionMedicine) {
    state = { ...state, medicines: [...state.medicines, m] };
    emit();
  },
  remove(key: string) {
    state = { ...state, medicines: state.medicines.filter((m) => m.key !== key) };
    emit();
  },
  clear() {
    state = { source: null, medicines: [] };
    emit();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const empty: State = { source: null, medicines: [] };

export function useSession() {
  return useSyncExternalStore(subscribe, () => state, () => empty);
}
