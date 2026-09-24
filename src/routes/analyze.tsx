import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileImage,
  ImageOff,
  Loader2,
  Pill,
  ScanLine,
  ServerCrash,
  UploadCloud,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { demoPrescription } from "@/lib/rxlens-demo";
import {
  analyzePrescription,
  type ExtractedField,
  type ExtractedMedicine,
  type PrescriptionAnalysis,
} from "@/lib/prescription-analysis.functions";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Prescription — RxLens" },
      { name: "description", content: "Upload a prescription image for a confidence-aware reading, or try the fictional RxLens demo prescription." },
      { property: "og:title", content: "Analyze Prescription — RxLens" },
      { property: "og:description", content: "Read, organize and understand prescription information with clear uncertainty and verification guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

const MAX_BYTES = 8 * 1024 * 1024;
const LOW_CONFIDENCE = 70;
const UNCLEAR_MSG = "RxLens couldn't confidently read this part. Please verify it with your doctor or pharmacist.";

type Source = { kind: "demo" } | { kind: "upload"; name: string; preview: string };
type Outcome =
  | { kind: "demo" }
  | { kind: "real"; analysis: PrescriptionAnalysis }
  | { kind: "unavailable"; detail: string };
type Stage = "upload" | "ready" | "processing" | "results";

function AnalyzePage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [source, setSource] = useState<Source | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);
  const analyze = useServerFn(analyzePrescription);

  useEffect(() => {
    if (stage !== "processing") return;
    setProgress(10);
    const t = window.setInterval(() => setProgress((c) => Math.min(c + 8, 92)), 500);
    return () => window.clearInterval(t);
  }, [stage]);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return setError("No image selected. Please choose a prescription image.");
    if (!["image/jpeg", "image/png"].includes(file.type))
      return setError("This file type isn't supported. Please upload a JPG or PNG image.");
    if (file.size > MAX_BYTES) return setError("This image is larger than 8 MB. Please upload a smaller image.");
    const reader = new FileReader();
    reader.onload = () => {
      const preview = typeof reader.result === "string" ? reader.result : "";
      if (!preview) return setError("The image could not be read. Please try another file.");
      setSource({ kind: "upload", name: file.name, preview });
      setOutcome(null);
      setStage("ready");
    };
    reader.onerror = () => setError("The image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  }

  function handleDemo() {
    runId.current++;
    setError(null);
    setSource({ kind: "demo" });
    setOutcome(null);
    setStage("ready");
  }

  async function startAnalysis() {
    if (!source) return setError("No image selected. Please choose a prescription image.");
    const id = ++runId.current;
    setStage("processing");
    if (source.kind === "demo") {
      await new Promise((r) => setTimeout(r, 2000));
      if (id !== runId.current) return;
      setOutcome({ kind: "demo" });
    } else {
      let next: Outcome;
      try {
        const res = await analyze({ data: { image: source.preview } });
        next = res.ok ? { kind: "real", analysis: res.analysis } : { kind: "unavailable", detail: res.message };
      } catch {
        next = { kind: "unavailable", detail: "The reading service could not be reached." };
      }
      if (id !== runId.current) return;
      setOutcome(next);
    }
    setProgress(100);
    setStage("results");
  }

  function reset() {
    runId.current++;
    setSource(null);
    setOutcome(null);
    setError(null);
    setStage("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="animate-fade-up">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Prescription Analyzer</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">
            Analyze your prescription
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Upload a clear image of your prescription.</p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
            <div
              className="rounded-3xl border border-dashed border-primary/35 bg-primary-soft/45 p-6 text-center transition-all hover:border-primary hover:bg-primary-soft sm:p-8"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-card text-primary shadow-lens">
                <UploadCloud className="size-8" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-foreground">Drag & drop your prescription</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">JPG and PNG supported. Maximum size: 8 MB.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button type="button" variant="hero" onClick={() => fileInputRef.current?.click()}>
                  <FileImage aria-hidden="true" />
                  Browse image
                </Button>
                <Button type="button" variant="clinical" onClick={() => cameraInputRef.current?.click()}>
                  <Camera aria-hidden="true" />
                  Camera/upload
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Browse prescription image" onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png" capture="environment" className="sr-only" aria-label="Open camera or upload prescription image" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>

            {error ? (
              <p role="alert" className="mt-4 rounded-2xl border border-destructive/40 bg-danger-soft p-4 text-sm font-semibold text-destructive">
                {error}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-sm leading-6 text-muted-foreground">
                No prescription handy? Explore the workflow with a clearly labeled fictional sample.
              </p>
              <Button type="button" variant="clinical" onClick={handleDemo}>
                <ScanLine aria-hidden="true" />
                Try Demo Prescription
              </Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Uploaded images are sent securely for reading only. They are not saved, and nothing is kept after you leave or refresh this page.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {stage === "upload" ? <DemoPrompt onTryDemo={handleDemo} /> : null}
          {source && stage !== "upload" ? <SourceBadge source={source} /> : null}
          {stage === "ready" && source ? <PreviewPanel source={source} onAnalyze={startAnalysis} onReset={reset} /> : null}
          {stage === "processing" && source ? <ProcessingPanel progress={progress} source={source} /> : null}
          {stage === "results" && source && outcome ? (
            <ResultsView source={source} outcome={outcome} onReset={reset} onTryDemo={handleDemo} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SourceBadge({ source }: { source: Source }) {
  return source.kind === "demo" ? (
    <span className="inline-flex rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-sm font-bold text-primary">Demo Mode</span>
  ) : (
    <span className="inline-flex rounded-full border border-success/30 bg-card px-3 py-1 text-sm font-bold text-foreground">Uploaded Prescription</span>
  );
}

function DemoPrompt({ onTryDemo }: { onTryDemo: () => void }) {
  return (
    <article className="rounded-3xl border border-border bg-soft-panel p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Pill className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Two ways to explore</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Upload your own prescription for a real reading, or use the fictional demo to see how results, uncertainty and safety guidance look.
          </p>
          <Button type="button" variant="hero" className="mt-5" onClick={onTryDemo}>
            Try Demo Prescription
          </Button>
        </div>
      </div>
    </article>
  );
}

function SourceImage({ source }: { source: Source }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      {source.kind === "demo" ? (
        <FictionalPrescription />
      ) : (
        <img src={source.preview} alt="Your uploaded prescription" className="max-h-[28rem] w-full object-contain" />
      )}
    </div>
  );
}

function PreviewPanel({ source, onAnalyze, onReset }: { source: Source; onAnalyze: () => void; onReset: () => void }) {
  return (
    <article className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Image preview</p>
          <h2 className="mt-2 truncate font-display text-2xl font-bold text-foreground">
            {source.kind === "demo" ? demoPrescription.label : source.name}
          </h2>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Remove selected prescription" onClick={onReset}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-5">
        <SourceImage source={source} />
      </div>
      <Button type="button" variant="hero" size="lg" className="mt-5 w-full" onClick={onAnalyze}>
        <ScanLine aria-hidden="true" />
        Analyze Prescription
      </Button>
    </article>
  );
}

function FictionalPrescription() {
  return (
    <div className="bg-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-destructive">{demoPrescription.label}</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-foreground">RxLens Sample Prescription</h3>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Demo Mode</span>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["Patient", "Demo Patient"],
          ["Medicine", "Amoxicillin 500 mg"],
          ["Frequency", "Example only"],
          ["Duration", "Example only"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-surface p-4">
            <dt className="font-bold text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-lg font-bold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProcessingPanel({ progress, source }: { progress: number; source: Source }) {
  const steps = ["Image received", "Reading visible text", "Organizing information", "Preparing explanation"];
  const active = progress < 30 ? 1 : progress < 60 ? 2 : 3;
  return (
    <article className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="grid size-14 place-items-center rounded-3xl bg-primary-soft text-primary">
          <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Reading prescription...</h2>
          <p className="mt-2 text-muted-foreground">
            {source.kind === "demo" ? "Loading the fictional demo sample." : "Reading your uploaded image. This can take a few seconds."}
          </p>
        </div>
      </div>
      <Progress value={progress} className="mt-6 h-3" aria-label="Prescription analysis progress" />
      <ol className="mt-6 grid gap-3">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm font-semibold text-foreground">
            {i < active ? <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> : null}
            {i === active ? <span className="size-3 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" /> : null}
            {i > active ? <span className="size-3 rounded-full border border-muted-foreground" aria-hidden="true" /> : null}
            {label}
          </li>
        ))}
      </ol>
      <div className="mt-5">
        <SourceImage source={source} />
      </div>
    </article>
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function ResultsView({ source, outcome, onReset, onTryDemo }: { source: Source; outcome: Outcome; onReset: () => void; onTryDemo: () => void }) {
  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="button" variant="hero" onClick={onReset}>Analyze another prescription</Button>
    </div>
  );

  if (outcome.kind === "unavailable") {
    return (
      <div className="animate-fade-up space-y-6">
        <Notice icon={ServerCrash} title="RxLens could not analyze this image because the reading service is unavailable." text={`No results were produced for your image. ${outcome.detail}`}>
          <Button type="button" variant="clinical" className="mt-4" onClick={onTryDemo}>Try Demo Prescription</Button>
        </Notice>
        <SourceImage source={source} />
        {actions}
      </div>
    );
  }

  if (outcome.kind === "demo") return <DemoResults onReset={onReset} />;

  const a = outcome.analysis;
  if (a.status === "not_prescription") {
    return (
      <div className="animate-fade-up space-y-6">
        <Notice icon={ImageOff} title="This image doesn't appear to contain a readable prescription. Please upload a clear prescription image." text="RxLens did not create any prescription information for this image." />
        <SourceImage source={source} />
        {actions}
      </div>
    );
  }
  if (a.status === "blurry" || (a.status !== "unreadable" && a.medicines.length === 0 && a.status !== "clear" && a.status !== "partial")) {
    return (
      <div className="animate-fade-up space-y-6">
        <Notice icon={AlertTriangle} title="This image is too blurry to read reliably." text="RxLens won't guess. Please upload a clearer, well-lit photo of the prescription." />
        <SourceImage source={source} />
        {actions}
      </div>
    );
  }

  const summary = `RxLens prescription summary. ${a.overall_confidence != null ? `Overall reading confidence ${Math.round(a.overall_confidence)} percent. This is reading confidence, not medical certainty.` : "Reading confidence unavailable."} ${a.medicines
    .map((m) => (m.name.value ? `Possible reading: ${m.name.value} ${m.strength.value ?? ""}.` : ""))
    .join(" ")} Always verify prescription information with your doctor or pharmacist before taking or changing medication.`;

  return (
    <div className="animate-fade-up space-y-6">
      <SummaryCard confidence={a.overall_confidence} onSpeak={() => speak(summary)} />
      <SourceImage source={source} />

      {a.status === "unreadable" || a.medicines.length === 0 ? (
        <Notice icon={AlertTriangle} title="Some handwriting may be unclear." text={UNCLEAR_MSG} />
      ) : a.status === "partial" ? (
        <Notice icon={AlertTriangle} title="Some handwriting may be unclear." text="Please verify uncertain information with your doctor or pharmacist." />
      ) : null}

      <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <p className="text-sm font-extrabold uppercase tracking-widest text-primary">A. Text detected in your image</p>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-surface p-4 font-sans text-sm leading-6 text-foreground">
          {a.ocr_text.trim() || "No readable text detected."}
        </pre>
      </article>

      {a.medicines.length > 0 ? (
        <div>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-primary">B. RxLens interpretation</p>
          <div className="grid gap-5 xl:grid-cols-2">
            {a.medicines.map((m, i) => (
              <RealMedicineCard key={i} medicine={m} />
            ))}
          </div>
        </div>
      ) : null}

      <SafetyBanner />
      {actions}
    </div>
  );
}

function needsCheck(f: ExtractedField) {
  return f.value == null || f.confidence == null || f.confidence < LOW_CONFIDENCE;
}

function RealMedicineCard({ medicine }: { medicine: ExtractedMedicine }) {
  const nameUncertain = needsCheck(medicine.name);
  const rows: [string, ExtractedField][] = [
    ["Strength", medicine.strength],
    ["Frequency", medicine.frequency],
    ["Duration", medicine.duration],
    ["Instructions", medicine.instructions],
  ];
  return (
    <article className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">Possible reading</p>
          <h3 className="break-words font-display text-2xl font-bold text-foreground">{medicine.name.value ?? "Unreadable name"}</h3>
        </div>
        <ConfidencePill value={medicine.name.confidence} />
      </div>
      {nameUncertain ? (
        <div className="mt-4 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-warning-foreground">
          <p className="font-bold text-foreground">⚠️ Needs verification</p>
          <p className="mt-1">{UNCLEAR_MSG}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-success">Readable — still confirm with your pharmacist</p>
      )}
      {medicine.name.source_text ? (
        <p className="mt-3 text-xs text-muted-foreground">Seen in image: “{medicine.name.source_text}”</p>
      ) : null}

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {rows.map(([label, f]) => (
          <div key={label} className="min-w-0 rounded-2xl bg-surface p-4">
            <dt className="flex items-center justify-between gap-2 font-bold text-muted-foreground">
              {label}
              <ConfidencePill value={f.confidence} small />
            </dt>
            <dd className="mt-1 break-words text-foreground">{f.value ?? "Not found or unclear"}</dd>
            {f.value && needsCheck(f) ? <dd className="mt-1 text-xs font-semibold text-warning-foreground">Needs verification</dd> : null}
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-2xl bg-primary-soft p-4">
        <p className="font-bold text-primary">C. General educational information</p>
        <p className="mt-2 leading-7 text-foreground">
          {!nameUncertain && medicine.educational_info
            ? medicine.educational_info
            : "Not shown because the medicine name could not be confidently read."}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This medicine is commonly used for certain conditions. Only your healthcare professional can confirm why it was prescribed for you.
        </p>
      </div>
    </article>
  );
}

function ConfidencePill({ value, small = false }: { value: number | null; small?: boolean }) {
  const text = value == null ? (small ? "—" : "Confidence unavailable") : `${Math.round(value)}%`;
  const low = value == null || value < LOW_CONFIDENCE;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-bold ${small ? "text-[11px]" : "text-xs"} ${low ? "bg-warning-soft text-warning-foreground" : "bg-primary-soft text-primary"}`}>
      {text}
    </span>
  );
}

function SummaryCard({ confidence, onSpeak, demo = false }: { confidence: number | null; onSpeak: () => void; demo?: boolean }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">{demo ? "Demo results" : "Your results"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Prescription Summary</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {confidence != null ? (
              <>Overall reading confidence: <span className="font-bold text-foreground">{Math.round(confidence)}%</span>{demo ? " (fictional value)" : ""}</>
            ) : (
              <span className="font-bold text-foreground">Reading confidence unavailable</span>
            )}
            <br />Prototype reading confidence — not medical certainty.
          </p>
        </div>
        <Button type="button" variant="clinical" onClick={onSpeak}>
          <Volume2 aria-hidden="true" />
          Read aloud
        </Button>
      </div>
      {confidence != null ? <Progress value={confidence} className="mt-5 h-3" aria-label={`Overall reading confidence ${Math.round(confidence)} percent`} /> : null}
    </article>
  );
}

function Notice({ icon: Icon, title, text, children }: { icon: typeof AlertTriangle; title: string; text: string; children?: React.ReactNode }) {
  return (
    <article role="status" className="rounded-3xl border border-warning/40 bg-warning-soft p-5 shadow-card">
      <div className="flex gap-3">
        <Icon className="mt-1 size-6 shrink-0 text-warning-foreground" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
          <p className="mt-2 leading-7 text-warning-foreground">{text}</p>
          {children}
        </div>
      </div>
    </article>
  );
}

function DemoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-fade-up space-y-6">
      <p className="rounded-2xl border border-destructive/30 bg-danger-soft p-3 text-center text-sm font-extrabold uppercase tracking-widest text-destructive">
        {demoPrescription.label}
      </p>
      <SummaryCard
        demo
        confidence={demoPrescription.confidence}
        onSpeak={() => speak("Fictional demo summary. This is not a real prescription. Always verify prescription information with your doctor or pharmacist.")}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {demoPrescription.medicines.map((m) => (
          <article key={m.name} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl font-bold text-foreground">{m.name}</h3>
                <p className="mt-1 font-semibold text-primary">{m.strength}</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{m.confidence}%</span>
            </div>
            {m.needsVerification ? (
              <div className="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-warning-foreground">
                <p className="font-display text-lg font-bold text-foreground">⚠️ Needs verification</p>
                <p>{m.possibleReading}</p>
                <p className="mt-1">{UNCLEAR_MSG}</p>
              </div>
            ) : null}
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4"><dt className="font-bold text-muted-foreground">Frequency</dt><dd className="mt-1 text-foreground">{m.frequency}</dd></div>
              <div className="rounded-2xl bg-surface p-4"><dt className="font-bold text-muted-foreground">Duration</dt><dd className="mt-1 text-foreground">{m.duration}</dd></div>
            </dl>
            <div className="mt-5 rounded-2xl bg-primary-soft p-4">
              <p className="font-bold text-primary">General purpose</p>
              <p className="mt-2 leading-7 text-foreground">{m.purpose}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.why}</p>
            </div>
          </article>
        ))}
      </div>
      <SafetyBanner />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="hero" onClick={onReset}>Analyze another prescription</Button>
      </div>
    </div>
  );
}
