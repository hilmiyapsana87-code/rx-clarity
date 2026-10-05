// Common Indian brand names → possible generic ingredients.
// Prototype lookup only. Brands vary by manufacturer and strength; a match is
// always shown as "Possible match — verify the medicine identity".

export type BrandEntry = { brand: string; ingredients: string[] };

const BRANDS: BrandEntry[] = [
  { brand: "Glycomet", ingredients: ["Metformin"] },
  { brand: "Glyciphage", ingredients: ["Metformin"] },
  { brand: "Obimet", ingredients: ["Metformin"] },
  { brand: "Augmentin", ingredients: ["Amoxicillin", "Clavulanic acid"] },
  { brand: "Clavam", ingredients: ["Amoxicillin", "Clavulanic acid"] },
  { brand: "Mox", ingredients: ["Amoxicillin"] },
  { brand: "Novamox", ingredients: ["Amoxicillin"] },
  { brand: "Crocin", ingredients: ["Paracetamol"] },
  { brand: "Dolo", ingredients: ["Paracetamol"] },
  { brand: "Calpol", ingredients: ["Paracetamol"] },
  { brand: "Brufen", ingredients: ["Ibuprofen"] },
  { brand: "Combiflam", ingredients: ["Ibuprofen", "Paracetamol"] },
  { brand: "Pan", ingredients: ["Pantoprazole"] },
  { brand: "Omez", ingredients: ["Omeprazole"] },
  { brand: "Ecosprin", ingredients: ["Aspirin"] },
  { brand: "Disprin", ingredients: ["Aspirin"] },
  { brand: "Amlong", ingredients: ["Amlodipine"] },
  { brand: "Amlopres", ingredients: ["Amlodipine"] },
  { brand: "Atorva", ingredients: ["Atorvastatin"] },
  { brand: "Lipitor", ingredients: ["Atorvastatin"] },
  { brand: "Cetzine", ingredients: ["Cetirizine"] },
  { brand: "Okacet", ingredients: ["Cetirizine"] },
  { brand: "Warf", ingredients: ["Warfarin"] },
];

export function brandLookup(text: string): BrandEntry | null {
  const t = text.toLowerCase().replace(/[^a-z ]/g, " ").trim();
  const first = t.split(/\s+/)[0] ?? "";
  return BRANDS.find((b) => b.brand.toLowerCase() === first || t.startsWith(b.brand.toLowerCase() + " ")) ?? null;
}
