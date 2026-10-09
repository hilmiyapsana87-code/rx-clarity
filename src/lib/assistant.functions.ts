import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SAFETY = `You are RxLens, an educational prescription-reading assistant. You are NOT a doctor or pharmacist.
Rules: Answer ONLY from the provided prescription context. Never diagnose. Never recommend starting, stopping, changing, replacing medicines or doses.
If the answer is not in the context or a field is unverified, say "I don't know confidently — please ask your doctor or pharmacist."
Keep answers short (max 5 sentences), plain language. End with a reminder to verify with a doctor or pharmacist.`;

async function callGateway(instructions: string, input: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, message: "The assistant service is unavailable." };
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", reasoning: { effort: "low" }, instructions, input }),
    });
    if (res.status === 429) return { ok: false, message: "Too many requests right now. Please try again shortly." };
    if (res.status === 402) return { ok: false, message: "The assistant service is out of credits." };
    if (!res.ok) return { ok: false, message: "The assistant service is unavailable." };
    const json = (await res.json()) as { output_text?: string; output?: Array<{ content?: Array<{ type: string; text?: string }> }> };
    const text = json.output_text ?? json.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text;
    return text ? { ok: true, text } : { ok: false, message: "No answer was returned." };
  } catch {
    return { ok: false, message: "The assistant service could not be reached." };
  }
}

export const askRxLens = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ question: z.string().min(1).max(500), context: z.string().max(8000) }).parse(d))
  .handler(({ data }) => callGateway(SAFETY, `Prescription context (as read by RxLens, may contain unverified items):\n${data.context}\n\nQuestion: ${data.question}`));

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1).max(6000), language: z.string().max(30) }).parse(d))
  .handler(({ data }) =>
    callGateway(
      `Translate the user's text into ${data.language}. Keep medicine names, strengths and numbers exactly as written in English. Preserve safety warnings faithfully. Output only the translation.`,
      data.text,
    ),
  );
