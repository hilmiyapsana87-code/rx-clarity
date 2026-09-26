import { INTERACTIONS, MEDICINES } from "./reference";
import type { InteractionRecord, MedicineInfoProvider, MedicineRecord } from "./types";

export * from "./types";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

export const localReferenceProvider: MedicineInfoProvider = {
  name: "RxLens prototype reference dataset",
  list: () => MEDICINES,
  get: (id) => MEDICINES.find((m) => m.medicine_id === id) ?? null,
  match(name) {
    const n = normalize(name);
    if (!n) return [];
    const words = n.split(" ");
    return MEDICINES.filter((m) => m.aliases.some((a) => a === n || words.includes(a) || (a.length >= 5 && n.startsWith(a))));
  },
  interaction(a, b): InteractionRecord | null {
    return (
      INTERACTIONS.find((i) => (i.medicine_a === a && i.medicine_b === b) || (i.medicine_a === b && i.medicine_b === a)) ?? null
    );
  },
};

// Swap this line to connect a verified database/API later.
export const medicineInfo: MedicineInfoProvider = localReferenceProvider;

export function interactionsFor(id: string): InteractionRecord[] {
  return INTERACTIONS.filter((i) => i.medicine_a === id || i.medicine_b === id);
}

export const UNAVAILABLE = "Information unavailable — verify with a healthcare professional.";

export function displayName(m: MedicineRecord) {
  return m.generic_name;
}
