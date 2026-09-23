import { AlertTriangle, ShieldAlert } from "lucide-react";

export function SafetyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-3xl border border-warning/40 bg-warning-soft p-5 shadow-card sm:p-6" aria-label="Prescription safety notice">
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-warning text-warning-foreground">
          {compact ? <AlertTriangle className="size-6" aria-hidden="true" /> : <ShieldAlert className="size-6" aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-foreground">RxLens provides information, not medical advice.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Always follow the prescription and advice provided by your qualified healthcare professional. RxLens never tells you to start, stop, replace, or change treatment.
          </p>
        </div>
      </div>
    </section>
  );
}
