import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// REAL analysis only. This module never imports or returns demo data.

export type ReadingStatus = "clear" | "partial" | "blurry" | "unreadable" | "not_prescription";

export type ExtractedField = {
  value: string | null;
  confidence: number | null;
  source_text: string | null;
};

export type ExtractedMedicine = {
  name: ExtractedField;
  strength: ExtractedField;
  frequency: ExtractedField;
  duration: ExtractedField;
  instructions: ExtractedField;
  educational_info: string | null;
};

export type PrescriptionAnalysis = {
  status: ReadingStatus;
  overall_confidence: number | null;
  ocr_text: string;
  medicines: ExtractedMedicine[];
};

export type AnalysisResponse =
  | { ok: true; analysis: PrescriptionAnalysis }
  | { ok: false; reason: "unavailable" | "invalid"; message: string };

const field = {
  type: "object",
  additionalProperties: false,
  required: ["value", "confidence", "source_text"],
  properties: {
    value: { type: ["string", "null"] },
    confidence: { type: ["number", "null"], description: "0-100 reading confidence for this field" },
    source_text: { type: ["string", "null"], description: "Exact text seen in the image" },
  },
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "overall_confidence", "ocr_text", "medicines"],
  properties: {
    status: { type: "string", enum: ["clear", "partial", "blurry", "unreadable", "not_prescription"] },
    overall_confidence: { type: ["number", "null"] },
    ocr_text: { type: "string" },
    medicines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "strength", "frequency", "duration", "instructions", "educational_info"],
        properties: {
          name: field,
          strength: field,
          frequency: field,
          duration: field,
          instructions: field,
          educational_info: { type: ["string", "null"] },
        },
      },
    },
  },
};

const PROMPT = `You are the reading engine of RxLens, an educational prescription-reading tool. You are NOT a doctor or pharmacist.
Look ONLY at the attached image.
1. ocr_text: transcribe exactly the visible text (keep line breaks). Write "[unclear]" for illegible parts. Never invent text.
2. status: "not_prescription" if the image is not a medical prescription; "blurry" if too blurry/low quality to read; "unreadable" if it is a prescription but the handwriting cannot be read; "partial" if some parts are readable; "clear" if mostly readable.
3. medicines: only medicines actually visible in the image. For each field give value, a 0-100 confidence reflecting how clearly you could READ it, and the exact source_text. Use null when a field is not present or unreadable. Do NOT guess. For blurry/unreadable/not_prescription return an empty medicines array.
4. educational_info: one short general sentence on what the medicine is commonly used for, e.g. "Commonly used for certain bacterial infections." Never say it is appropriate for this patient, never give dosing advice, never suggest starting, stopping or changing medication. null if the name is uncertain.
5. overall_confidence: 0-100 reading confidence for the whole image, or null if not applicable.
Do not include patient names or personal details in medicine fields.`;

export const analyzePrescription = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        image: z
          .string()
          .regex(/^data:image\/(png|jpeg);base64,/)
          .max(12_000_000),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<AnalysisResponse> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false, reason: "unavailable", message: "Reading service is not configured." };
    }
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          reasoning: { effort: "low" },
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: PROMPT },
                { type: "input_image", image_url: data.image },
              ],
            },
          ],
          text: { format: { type: "json_schema", name: "prescription_reading", strict: true, schema } },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("Reading service error", res.status, body.slice(0, 500));
        return { ok: false, reason: "unavailable", message: `Reading service returned ${res.status}.` };
      }
      const json = (await res.json()) as {
        output_text?: string;
        output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>;
      };
      const text =
        json.output_text ??
        json.output
          ?.flatMap((o) => o.content ?? [])
          .find((c) => c.type === "output_text")?.text;
      if (!text) {
        return { ok: false, reason: "unavailable", message: "The reading service returned no result." };
      }
      const analysis = JSON.parse(text) as PrescriptionAnalysis;
      return { ok: true, analysis };
    } catch (error) {
      console.error("Reading service failure", error);
      return { ok: false, reason: "unavailable", message: "The reading service could not be reached." };
    }
  });
