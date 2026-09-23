import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-extrabold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">{title}</h1>
      {children ? <p className="mt-4 text-lg leading-8 text-muted-foreground">{children}</p> : null}
    </div>
  );
}
