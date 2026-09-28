// Explains common prescription abbreviations in plain language.
// It only translates what is written — it never changes the instruction.

const TERMS: Record<string, string> = {
  po: "by mouth",
  od: "once a day",
  qd: "once a day",
  bd: "twice a day",
  bid: "twice a day",
  tds: "three times a day",
  tid: "three times a day",
  qid: "four times a day",
  qds: "four times a day",
  hs: "at bedtime",
  pc: "after food",
  ac: "before food",
  sos: "only when needed",
  prn: "only when needed",
  stat: "immediately",
  tab: "tablet",
  tabs: "tablets",
  cap: "capsule",
  caps: "capsules",
  mane: "in the morning",
  nocte: "at night",
  x: "for",
  d: "days",
  days: "days",
  wk: "week",
};

export type DecodedInstruction = { explanation: string | null; unknown: string[] };

export function decodeInstruction(text: string | null | undefined): DecodedInstruction {
  if (!text || !text.trim()) return { explanation: null, unknown: [] };
  const tokens = text.toLowerCase().replace(/[.,;]/g, " ").split(/\s+/).filter(Boolean);
  const out: string[] = [];
  const unknown: string[] = [];
  let recognised = 0;
  for (const t of tokens) {
    if (TERMS[t]) {
      out.push(TERMS[t]);
      recognised++;
    } else if (/^\d+([-/]\d+)*$/.test(t) || /^\d+(mg|ml|g|mcg)$/.test(t)) out.push(t);
    else if (/^[a-z]+$/.test(t) && t.length > 3) out.push(t);
    else {
      out.push(t);
      unknown.push(t);
    }
  }
  if (recognised === 0) return { explanation: null, unknown };
  let s = out.join(" ");
  if (tokens.some((t) => t === "tab" || t === "cap" || t === "tabs" || t === "caps") && !/^take/.test(s)) s = `Take ${s}`;
  return { explanation: s.charAt(0).toUpperCase() + s.slice(1) + ".", unknown };
}

export type Slot = "Morning" | "Afternoon" | "Night" | "As needed";

/** Returns schedule slots only when the frequency is unambiguous; otherwise null. */
export function scheduleSlots(freq: string | null | undefined): Slot[] | null {
  if (!freq) return null;
  const f = ` ${freq.toLowerCase()} `;
  if (/\b(sos|prn)\b|when needed|as needed/.test(f)) return ["As needed"];
  if (/\b(qid|qds)\b|four times/.test(f)) return ["Morning", "Afternoon", "Night"];
  if (/\b(tid|tds)\b|three times|3 times/.test(f)) return ["Morning", "Afternoon", "Night"];
  if (/\b(bid|bd)\b|twice|2 times/.test(f)) return ["Morning", "Night"];
  if (/\b(hs|nocte)\b|bedtime|at night/.test(f)) return ["Night"];
  if (/\b(od|qd|mane)\b|once/.test(f)) return ["Morning"];
  return null;
}
