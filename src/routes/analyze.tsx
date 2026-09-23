import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  Pill,
  ScanLine,
  ShieldCheck,
  UploadCloud,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { demoPrescription, processingSteps } from "@/lib/rxlens-demo";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Prescription — RxLens Demo" },
      { name: "description", content: "Upload a prescription image or try the fictional RxLens demo prescription to see confidence-aware educational results." },
      { property: "og:title", content: "Analyze Prescription — RxLens Demo" },
      { property: "og:description", content: "Try the RxLens hackathon MVP workflow from upload to organized prescription summary and safety guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

type Stage = "upload" | "ready" | "processing" | "results";

type UploadState = {
  name: string;
  preview: string;
  isDemo: boolean;
};

function AnalyzePage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isLowConfidence = useMemo(() => upload?.isDemo === false, [upload]);
  const overallConfidence = isLowConfidence ? 62 : demoPrescription.confidence;

  useEffect(() => {
    if (stage !== "processing") return;

    setProgress(12);
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 18, 96));
    }, 420);
    const finishTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setProgress(100);
      setStage("results");
    }, 2200);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, [stage]);

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setUpload({ name: file.name, preview: result, isDemo: false });
      setStage("ready");
      setProgress(0);
    };
    reader.readAsDataURL(file);
  }

  function handleDemo() {
    setUpload({ name: demoPrescription.label, preview: "", isDemo: true });
    setStage("ready");
    setProgress(0);
  }

  function startAnalysis() {
    if (!upload) return;
    setStage("processing");
  }

  function resetDemo() {
    setUpload(null);
    setStage("upload");
    setProgress(0);
  }

  function speakSummary() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const summary = `RxLens prescription summary. Overall reading confidence is ${overallConfidence} percent. This is prototype confidence, not medical certainty. Please verify uncertain information with your doctor or pharmacist.`;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(summary));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="animate-fade-up">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Prescription Analyzer</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">
            Analyze your prescription
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Upload a clear image of your prescription.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
            <div
              className="rounded-3xl border border-dashed border-primary/35 bg-primary-soft/45 p-6 text-center transition-all hover:border-primary hover:bg-primary-soft sm:p-8"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files[0]);
              }}
            >
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-card text-primary shadow-lens">
                <UploadCloud className="size-8" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-foreground">Drag & drop your prescription</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">JPG and PNG supported. Recommended maximum size: 8 MB.</p>
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                aria-label="Browse prescription image"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                className="sr-only"
                aria-label="Open camera or upload prescription image"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <p className="text-sm leading-6 text-muted-foreground">
                For the hackathon demo, use the fictional sample to complete the workflow in under 60 seconds.
              </p>
              <Button type="button" variant="clinical" onClick={handleDemo}>
                <ScanLine aria-hidden="true" />
                Try Demo Prescription
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {stage === "upload" ? <DemoPrompt onTryDemo={handleDemo} /> : null}
          {stage === "ready" && upload ? (
            <PreviewPanel upload={upload} onAnalyze={startAnalysis} onReset={resetDemo} />
          ) : null}
          {stage === "processing" ? <ProcessingPanel progress={progress} lowConfidence={isLowConfidence} /> : null}
          {stage === "results" ? (
            <ResultsPanel confidence={overallConfidence} lowConfidence={isLowConfidence} onReset={resetDemo} onSpeak={speakSummary} />
          ) : null}
        </div>
      </div>
    </section>
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
          <h2 className="font-display text-2xl font-bold text-foreground">Complete demo ready</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Use fictional data to demonstrate upload, reading, uncertainty handling, medicine explanation, and safety guidance without using real patient information.
          </p>
          <Button type="button" variant="hero" className="mt-5" onClick={onTryDemo}>
            Try Demo Prescription
          </Button>
        </div>
      </div>
    </article>
  );
}

function PreviewPanel({ upload, onAnalyze, onReset }: { upload: UploadState; onAnalyze: () => void; onReset: () => void }) {
  return (
    <article className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Image preview</p>
          <h2 className="mt-2 truncate font-display text-2xl font-bold text-foreground">{upload.name}</h2>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Remove selected prescription" onClick={onReset}>
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-surface">
        {upload.isDemo ? <FictionalPrescription /> : <img src={upload.preview} alt="Uploaded prescription preview" className="max-h-[28rem] w-full object-contain" />}
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm leading-6 text-warning-foreground">
        {upload.isDemo ? demoPrescription.label : "Prototype mode: no real OCR or medical API is used for uploaded images in this MVP."}
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
          <p className="text-xs font-extrabold uppercase tracking-widest text-destructive">FICTIONAL DEMO — NOT A REAL PRESCRIPTION</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-foreground">RxLens Sample Prescription</h3>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Demo Mode</span>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-surface p-4">
          <dt className="font-bold text-muted-foreground">Patient</dt>
          <dd className="mt-1 text-lg font-bold text-foreground">Demo Patient</dd>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <dt className="font-bold text-muted-foreground">Medicine</dt>
          <dd className="mt-1 text-lg font-bold text-foreground">Amoxicillin 500 mg</dd>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <dt className="font-bold text-muted-foreground">Frequency</dt>
          <dd className="mt-1 text-foreground">Example only</dd>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <dt className="font-bold text-muted-foreground">Duration</dt>
          <dd className="mt-1 text-foreground">Example only</dd>
        </div>
      </dl>
    </div>
  );
}

function ProcessingPanel({ progress, lowConfidence }: { progress: number; lowConfidence: boolean }) {
  return (
    <article className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="grid size-14 place-items-center rounded-3xl bg-primary-soft text-primary">
          <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Reading prescription...</h2>
          <p className="mt-2 text-muted-foreground">Organizing visible prescription information for the demo results.</p>
        </div>
      </div>
      <Progress value={progress} className="mt-6 h-3" aria-label="Prescription analysis progress" />
      <ol className="mt-6 grid gap-3">
        {processingSteps.map((step) => (
          <li key={step.label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm font-semibold text-foreground">
            {step.state === "complete" ? <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> : null}
            {step.state === "active" ? <span className="size-3 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" /> : null}
            {step.state === "pending" ? <span className="size-3 rounded-full border border-muted-foreground" aria-hidden="true" /> : null}
            {step.label}
          </li>
        ))}
      </ol>
      {lowConfidence ? (
        <div className="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm font-semibold leading-6 text-warning-foreground">
          Some handwriting may be unclear. Please verify uncertain information with your doctor or pharmacist.
        </div>
      ) : null}
    </article>
  );
}

function ResultsPanel({ confidence, lowConfidence, onReset, onSpeak }: { confidence: number; lowConfidence: boolean; onReset: () => void; onSpeak: () => void }) {
  return (
    <div className="animate-fade-up space-y-6">
      <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Results dashboard</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Prescription Summary</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Overall reading confidence: <span className="font-bold text-foreground">{confidence}%</span>. This is prototype confidence, not medical certainty.
            </p>
          </div>
          <Button type="button" variant="clinical" onClick={onSpeak}>
            <Volume2 aria-hidden="true" />
            Read aloud
          </Button>
        </div>
        <Progress value={confidence} className="mt-5 h-3" aria-label={`Overall reading confidence ${confidence} percent`} />
      </article>

      {lowConfidence ? (
        <article className="rounded-3xl border border-warning/40 bg-warning-soft p-5 shadow-card">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 size-6 shrink-0 text-warning-foreground" aria-hidden="true" />
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Some handwriting may be unclear.</h3>
              <p className="mt-2 leading-7 text-warning-foreground">RxLens couldn't confidently read this part. Please verify it with your doctor or pharmacist.</p>
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        {demoPrescription.medicines.map((medicine) => (
          <article key={medicine.name} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl font-bold text-foreground">{medicine.name}</h3>
                <p className="mt-1 font-semibold text-primary">{medicine.strength}</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{medicine.confidence}%</span>
            </div>

            {medicine.needsVerification ? (
              <div className="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4">
                <p className="font-display text-lg font-bold text-foreground">⚠️ Needs verification</p>
                <p className="mt-2 text-sm leading-6 text-warning-foreground">{medicine.possibleReading}</p>
                <p className="text-sm leading-6 text-warning-foreground">Confidence: {medicine.confidence}%</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-warning-foreground">Please verify the medicine name before using this information.</p>
                <Button type="button" variant="clinical" className="mt-4">
                  Verify with Pharmacist/Doctor
                </Button>
              </div>
            ) : null}

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4">
                <dt className="font-bold text-muted-foreground">Frequency</dt>
                <dd className="mt-1 text-foreground">{medicine.frequency}</dd>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <dt className="font-bold text-muted-foreground">Duration</dt>
                <dd className="mt-1 text-foreground">{medicine.duration}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl bg-primary-soft p-4">
              <p className="font-bold text-primary">General purpose</p>
              <p className="mt-2 leading-7 text-foreground">{medicine.purpose}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <h4 className="font-display text-lg font-bold text-foreground">Why might this medicine be prescribed?</h4>
              <p className="mt-2 leading-7 text-muted-foreground">{medicine.why}</p>
            </div>
          </article>
        ))}
      </div>

      <SafetyBanner />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="hero" onClick={onReset}>Analyze another prescription</Button>
        <Button type="button" variant="clinical" onClick={onSpeak}>Text-to-speech summary</Button>
      </div>
    </div>
  );
}
