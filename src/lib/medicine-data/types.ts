// Medicine information data model. Kept separate from the UI so the local
// reference dataset can be replaced by a verified drug database/API later.

export type SourceRef = { name: string; url: string | null };

export type MedicineRecord = {
  medicine_id: string;
  generic_name: string;
  brand_name: string[]; // example brand names; availability varies by country
  aliases: string[]; // lowercase spellings used for matching OCR text
  active_ingredients: string[];
  inactive_ingredients: string | null; // null = not available in reference data
  common_strengths: string[];
  dosage_forms: string[];
  therapeutic_class: string;
  indications: string[];
  mechanism: { simple: string; detailed: string | null };
  common_side_effects: string[];
  important_side_effects: string[]; // contact a healthcare professional
  serious_warnings: string[]; // urgent medical attention
  food_interactions: string[];
  alcohol: string | null;
  condition_warnings: string[]; // "Tell your healthcare professional if you have..."
  onset_information: string | null;
  duration_information: string | null;
  treatment_duration: string | null;
  sources: SourceRef[];
  last_verified_date: string;
};

export type InteractionSeverity = "major" | "moderate" | "minor";

export type InteractionRecord = {
  medicine_a: string; // medicine_id
  medicine_b: string;
  severity: InteractionSeverity;
  interaction_type: string;
  interaction_description: string;
  clinical_concern: string;
  sources: SourceRef[];
  last_verified_date: string;
};

/** Any future verified database/API only needs to implement this interface. */
export interface MedicineInfoProvider {
  readonly name: string;
  list(): MedicineRecord[];
  get(id: string): MedicineRecord | null;
  /** Returns every record whose name/alias matches. >1 result = ambiguous. */
  match(name: string): MedicineRecord[];
  interaction(a: string, b: string): InteractionRecord | null;
}
