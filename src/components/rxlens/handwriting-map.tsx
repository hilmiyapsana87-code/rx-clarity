import { useState } from "react";
import { confidenceLevel } from "@/lib/medicine-session";

export type MapLine = { raw: string; reason: string; confidence: number | null };

const tone = {
  high: "border-success bg-success/10",
  medium: "border-warning bg-warning/15",
  low: "border-destructive bg-destructive/10",
} as const;

export function HandwritingMap({ lines }: { lines: MapLine[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const cur = sel != null ? lines[sel] : null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Handwriting difficulty map</p>
      <div className="mt-3 grid gap-2 rounded-xl bg-surface p-3">
        {lines.map((l, i) => {
          const lvl = confidenceLevel(l.confidence);
          return (
            <button key={i} type="button" onClick={() => setSel(i === sel ? null : i)} aria-pressed={sel === i}
              aria-label={`Line ${i + 1}: ${lvl} reading confidence. Tap for reason.`}
              className={`rounded-lg border-2 px-3 py-2 text-left font-mono text-sm text-foreground transition-transform hover:scale-[1.01] ${tone[lvl]}`}>
              {l.raw}
            </button>
          );
        })}
      </div>
      {cur ? (
        <p className="mt-3 rounded-xl bg-primary-soft p-3 text-sm text-foreground" role="status">
          <strong>{cur.confidence != null ? `${Math.round(cur.confidence)}% reading confidence. ` : "Confidence unavailable. "}</strong>
          {cur.reason}
        </p>
      ) : <p className="mt-3 text-xs text-muted-foreground">Tap a line to see why it was easy or hard to read.</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1"><i className="size-3 rounded border-2 border-success" />Read confidently</span>
        <span className="flex items-center gap-1"><i className="size-3 rounded border-2 border-warning" />Verify</span>
        <span className="flex items-center gap-1"><i className="size-3 rounded border-2 border-destructive" />Unreadable</span>
      </div>
    </div>
  );
}
