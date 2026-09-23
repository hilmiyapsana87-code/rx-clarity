import { Activity, CheckCircle2, ScanLine, ShieldCheck } from "lucide-react";

export function PrescriptionVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up" aria-label="Fictional prescription scanning illustration">
      <div className="absolute -left-2 top-10 z-20 rounded-full border border-success/30 bg-card px-3 py-2 text-xs font-bold text-success shadow-card sm:-left-8">
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Prescription detected
        </span>
      </div>
      <div className="absolute -right-1 bottom-14 z-20 rounded-full border border-primary/20 bg-card px-3 py-2 text-xs font-bold text-primary shadow-card sm:-right-8">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Information organized
        </span>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="absolute inset-x-8 top-7 h-0.5 bg-scan shadow-lens animate-scan-line" aria-hidden="true" />
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">RxLens Clinic</p>
            <p className="mt-1 text-sm text-muted-foreground">Fictional prescription</p>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <ScanLine className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm">
            <span className="font-semibold text-muted-foreground">Patient</span>
            <span className="font-bold text-foreground">Demo Patient</span>
            <span className="font-semibold text-muted-foreground">Date</span>
            <span className="text-foreground">Prototype sample</span>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="mb-3 h-3 w-32 rounded-full bg-primary/20" />
            <div className="space-y-3">
              <div className="h-4 w-4/5 rounded-full bg-foreground/15" />
              <div className="h-4 w-3/5 rounded-full bg-foreground/10" />
              <div className="h-4 w-2/3 rounded-full bg-foreground/10" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
              <p className="text-xs font-bold uppercase text-primary">Medicine</p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">Amoxicillin</p>
              <p className="text-sm text-muted-foreground">500 mg</p>
            </div>
            <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
              <p className="text-xs font-bold uppercase text-warning-foreground">Verify</p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">Metformin?</p>
              <p className="text-sm text-muted-foreground">64% confidence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm text-muted-foreground">
            <Activity className="size-4 text-success" aria-hidden="true" />
            Confidence-aware reading in demo mode
          </div>
        </div>
      </div>
    </div>
  );
}
