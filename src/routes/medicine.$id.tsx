import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SafetyBanner } from "@/components/rxlens/safety-banner";
import { PageHeader, Sources } from "@/components/rxlens/med-ui";
import { interactionsFor, medicineInfo, UNAVAILABLE } from "@/lib/medicine-data/provider";

export const Route = createFileRoute("/medicine/$id")({
  loader: ({ params }) => {
    const m = medicineInfo.get(params.id);
    if (!m) throw notFound();
    return { id: m.medicine_id, name: m.generic_name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Medicine"} — RxLens Medicine Profile` },
      { name: "description", content: `Educational profile of ${loaderData?.name ?? "this medicine"}: uses, how it works, side effects, interactions and sources.` },
      { property: "og:title", content: `${loaderData?.name ?? "Medicine"} — RxLens` },
      { property: "og:description", content: "Educational medicine information with sources. Always verify with your pharmacist." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

const List = ({ items, empty = UNAVAILABLE }: { items: string[]; empty?: string }) =>
  items.length ? <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="text-muted-foreground">{empty}</p>;

function Profile() {
  const { id } = Route.useLoaderData();
  const m = medicineInfo.get(id)!;
  const ints = interactionsFor(id);
  const sections: [string, React.ReactNode][] = [
    ["What's inside?", <><p><b>Active:</b> {m.active_ingredients.join(", ")}</p><p className="mt-1"><b>Inactive:</b> {m.inactive_ingredients ?? `${UNAVAILABLE} (varies by manufacturer)`}</p></>],
    ["What is it used for?", <><List items={m.indications} /><p className="mt-2 text-muted-foreground">Only your healthcare professional can confirm why it was prescribed for you.</p></>],
    ["How does it work?", <><p><b>Simple:</b> {m.mechanism.simple}</p><p className="mt-2"><b>Detailed:</b> {m.mechanism.detailed ?? UNAVAILABLE}</p></>],
    ["Possible side effects", <><p className="font-bold">🟢 Common / usually mild</p><List items={m.common_side_effects} /><p className="mt-3 font-bold">🟠 Contact a healthcare professional</p><List items={m.important_side_effects} /><p className="mt-3 text-muted-foreground">Side effects vary between people. This information is educational and does not replace medical advice.</p></>],
    ["🔴 Serious warnings", <List items={m.serious_warnings} />],
    ["Drug interactions", ints.length ? <ul className="space-y-2">{ints.map((i) => <li key={i.medicine_a + i.medicine_b}><b>{i.medicine_a} ↔ {i.medicine_b} ({i.severity}):</b> {i.interaction_description} Discuss with your doctor/pharmacist.</li>)}</ul> : <p className="text-muted-foreground">No interaction information available in RxLens reference data.</p>],
    ["Food & beverage considerations", <><List items={m.food_interactions} empty="No specific food interaction information available." /><p className="mt-2"><b>Alcohol:</b> {m.alcohol ?? "No specific information available."}</p></>],
    ["Important health conditions", m.condition_warnings.length ? <p>Tell your healthcare professional if you have: {m.condition_warnings.join(", ")}.</p> : <p className="text-muted-foreground">{UNAVAILABLE}</p>],
    ["What should I expect?", <><p><b>Onset:</b> {m.onset_information ?? UNAVAILABLE}</p><p><b>Duration of effect:</b> {m.duration_information ?? UNAVAILABLE}</p><p><b>Treatment duration:</b> {m.treatment_duration ?? "Set by your prescriber."}</p><p className="mt-2 text-muted-foreground">How quickly this medicine works can vary depending on the medicine, condition, dose, and individual patient. Do not change the prescribed dose or treatment duration based on this information.</p></>],
  ];
  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/medicines" className="text-sm font-bold text-primary hover:underline">← My Medicines</Link>
      <PageHeader eyebrow={m.therapeutic_class} title={m.generic_name} text={`Example brands: ${m.brand_name.join(", ")}. Forms: ${m.dosage_forms.join(", ")}. Common strengths: ${m.common_strengths.join(", ")}.`} />
      <Accordion type="multiple" defaultValue={["0"]} className="rounded-3xl border border-border bg-card px-6 shadow-card">
        {sections.map(([t, c], i) => (
          <AccordionItem key={t} value={String(i)}>
            <AccordionTrigger className="font-display text-lg font-bold">{t}</AccordionTrigger>
            <AccordionContent className="text-base leading-7">{c}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Sources sources={m.sources} date={m.last_verified_date} />
      <SafetyBanner />
    </section>
  );
}
