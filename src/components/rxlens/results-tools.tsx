import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, Languages, Mic, Send, Users, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { askRxLens, translateText } from "@/lib/assistant.functions";
import { scheduleSlots, type Slot } from "@/lib/instruction-decoder";
import type { SessionMedicine } from "@/lib/medicine-session";
import { safetyGate, verificationItems } from "@/lib/safety-logic";
import { LANGUAGES, settings, speakText, useSettings } from "@/lib/settings";

const nm = (m: SessionMedicine, i: number) => m.name ?? `Unreadable medicine ${i + 1}`;

function contextOf(meds: SessionMedicine[]) {
  return meds
    .map((m, i) => `${nm(m, i)} | strength: ${m.strength ?? "not detected"} | frequency: ${m.frequency ?? "not detected"} | duration: ${m.duration ?? "not detected"} | instructions: ${m.instructions ?? "not detected"} | name confidence: ${m.conf.name ?? "unknown"}`)
    .join("\n");
}

function plainSummary(meds: SessionMedicine[]) {
  const gate = safetyGate(meds);
  const items = verificationItems(meds);
  return [
    `RxLens found ${meds.length} possible medicine${meds.length === 1 ? "" : "s"}.`,
    ...meds.map((m, i) => `${nm(m, i)}: ${m.strength ?? "strength not detected"}, ${m.frequency ?? "frequency not detected"}, ${m.duration ?? "duration not detected"}.`),
    `Safety status: ${gate.status}. ${items.length} detail${items.length === 1 ? "" : "s"} need verification.`,
    "RxLens provides information, not medical advice. Please verify everything with your doctor or pharmacist.",
  ].join(" ");
}

/** Schedule confirmation, language/listen, caregiver summary and Ask RxLens for the current results. */
export function ResultsTools({ meds }: { meds: SessionMedicine[] }) {
  return (
    <div className="space-y-6">
      <ConfirmedTimeline meds={meds} />
      <ListenTranslate meds={meds} />
      <CaregiverSummary meds={meds} />
      <AskBox meds={meds} />
    </div>
  );
}

function ConfirmedTimeline({ meds }: { meds: SessionMedicine[] }) {
  const [confirmed, setConfirmed] = useState<Record<string, Slot[]>>({});
  const order: Slot[] = ["Morning", "Afternoon", "Night", "As needed"];
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 text-primary"><CalendarCheck className="size-5" aria-hidden="true" /><p className="text-xs font-extrabold uppercase tracking-widest">Possible schedule detected</p></div>
      <p className="mt-2 text-sm text-muted-foreground">Nothing is added to the timeline until you confirm it matches your prescription.</p>
      <ul className="mt-4 grid gap-3">
        {meds.map((m, i) => {
          const slots = m.conf.frequency != null && m.conf.frequency >= 60 ? scheduleSlots(m.frequency) : null;
          const done = confirmed[m.key];
          return (
            <li key={m.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{nm(m, i)}</p>
                <p className="text-muted-foreground">{slots ? `Possible: ${slots.join(", ")} (from “${m.frequency}”)` : "Schedule unclear — verify with your pharmacist."}</p>
              </div>
              {slots ? (
                done ? (
                  <Button size="sm" variant="outline" onClick={() => setConfirmed(({ [m.key]: _, ...r }) => r)}>Undo</Button>
                ) : (
                  <Button size="sm" variant="clinical" onClick={() => setConfirmed((c) => ({ ...c, [m.key]: slots }))}>Confirm matches my prescription</Button>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
      {Object.keys(confirmed).length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {order.map((s) => {
            const list = meds.filter((m) => confirmed[m.key]?.includes(s));
            return list.length ? (
              <div key={s} className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
                <p className="font-bold text-primary">{s}</p>
                <ul className="mt-1 text-sm text-foreground">{list.map((m) => <li key={m.key}>{m.name}</li>)}</ul>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">User-confirmed</p>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
    </article>
  );
}

function ListenTranslate({ meds }: { meds: SessionMedicine[] }) {
  const { lang } = useSettings();
  const translate = useServerFn(translateText);
  const [text, setText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const base = plainSummary(meds);
  const label = LANGUAGES.find((l) => l.code === lang)!.label;

  async function run() {
    setErr(null);
    if (lang === "en") return setText(null);
    setBusy(true);
    const r = await translate({ data: { text: base, language: label } }).catch(() => ({ ok: false as const, message: "Translation unavailable." }));
    setBusy(false);
    if (r.ok) setText(r.text);
    else setErr(r.message);
  }

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 text-primary"><Languages className="size-5" aria-hidden="true" /><p className="text-xs font-extrabold uppercase tracking-widest">Language & Read Aloud</p></div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select aria-label="Language" value={lang} onChange={(e) => { settings.setLang(e.target.value as typeof lang); setText(null); }} className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground">
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        {lang !== "en" ? <Button size="sm" variant="clinical" onClick={run} disabled={busy}>{busy ? "Translating…" : "Translate summary"}</Button> : null}
        <Button size="sm" variant="outline" onClick={() => speakText(text ?? base, text ? lang : "en")}><Volume2 aria-hidden="true" />Listen</Button>
      </div>
      <p className="mt-4 rounded-2xl bg-surface p-4 text-sm leading-7 text-foreground">{text ?? base}</p>
      {err ? <p className="mt-2 text-sm font-semibold text-destructive">{err}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">Translations are machine-generated. Medicine names are kept as written.</p>
    </article>
  );
}

function CaregiverSummary({ meds }: { meds: SessionMedicine[] }) {
  const gate = safetyGate(meds);
  const items = verificationItems(meds);
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 text-primary"><Users className="size-5" aria-hidden="true" /><p className="text-xs font-extrabold uppercase tracking-widest">Caregiver summary</p></div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface p-4"><dt className="text-xs text-muted-foreground">Possible medicines</dt><dd className="font-display text-2xl font-bold text-foreground">{meds.length}</dd></div>
        <div className="rounded-2xl bg-surface p-4"><dt className="text-xs text-muted-foreground">Safety status</dt><dd className="font-bold text-foreground">{gate.status}</dd></div>
        <div className="rounded-2xl bg-surface p-4"><dt className="text-xs text-muted-foreground">Needs verification</dt><dd className="font-display text-2xl font-bold text-foreground">{items.length}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">No patient name or personal details are included.</p>
    </article>
  );
}

type SR = { start: () => void; lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void };

function AskBox({ meds }: { meds: SessionMedicine[] }) {
  const { lang } = useSettings();
  const ask = useServerFn(askRxLens);
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);

  async function submit() {
    if (!q.trim()) return;
    setBusy(true);
    setA(null);
    const r = await ask({ data: { question: q, context: contextOf(meds) } }).catch(() => ({ ok: false as const, message: "The assistant service could not be reached." }));
    setBusy(false);
    setA(r.ok ? r.text : r.message);
  }

  function mic() {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!C) return setA("Voice input isn't supported in this browser. Please type your question.");
    const r = new C();
    r.lang = LANGUAGES.find((l) => l.code === lang)!.speech;
    r.onresult = (e) => setQ(e.results[0]?.[0]?.transcript ?? "");
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Ask RxLens</p>
      <p className="mt-1 text-sm text-muted-foreground">Answers come only from these results. RxLens won't diagnose or advise on doses.</p>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What does BD mean?" aria-label="Your question" className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground" />
        <Button type="button" size="icon" variant="outline" onClick={mic} aria-label="Speak your question" aria-pressed={listening}><Mic aria-hidden="true" /></Button>
        <Button type="submit" size="icon" variant="hero" disabled={busy} aria-label="Ask"><Send aria-hidden="true" /></Button>
      </form>
      {busy ? <p className="mt-3 text-sm text-muted-foreground">Thinking…</p> : null}
      {a ? (
        <div className="mt-3 rounded-2xl bg-surface p-4 text-sm leading-7 text-foreground" aria-live="polite">
          {a}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => speakText(a, lang)}><Volume2 aria-hidden="true" />Listen</Button>
        </div>
      ) : null}
    </article>
  );
}
