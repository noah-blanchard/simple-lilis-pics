import type { Locale } from "@lili/core/i18n/routing";
import { PillButton } from "@lili/ui/components/PillButton";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { WaxSeal } from "@lili/ui/components/WaxSeal";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Print } from "@/components/Print";
import { Rule } from "@/components/Rule";
import { Sheet } from "@/components/Sheet";
import { TextLink } from "@/components/TextLink";
import { Tone } from "@/components/Tone";
import { PLACEHOLDERS } from "@/data/placeholder-photos";
import { formatTime } from "@/lib/format";

// Dev-only tool: shows every foundation piece in both tones. Never ships.
const MOMENT_TIMES = [660, 840, 930, 975, 1020, 1170, 1230, 1420];

const Kit = ({ tone, locale }: { tone: "day" | "night"; locale: Locale }) => (
  <Tone tone={tone} as="section" className="container-site section-y">
    <p className="mb-6 text-muted">Tone: {tone}</p>
    <SectionHeader titleBase="Centred line" titleAccent="accent line" />
    <SectionHeader
      titleBase="Left line"
      titleAccent="accent line"
      align="left"
      className="mt-10"
    />
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      <Sheet keyline className="p-10">
        <p>A paper card keeps its day colours, even on the table.</p>
        <div className="mt-6">
          <PillButton variant="light">Button</PillButton>
        </div>
        <p className="mt-6">
          <a href="#kit" className="text-fg">
            Focus ring inside paper
          </a>
        </p>
      </Sheet>
      <Print
        photo={{
          src: PLACEHOLDERS.portrait01.src,
          alt: PLACEHOLDERS.portrait01.alt[locale],
          ratio: "4/5",
          sizes: "(min-width: 768px) 40vw, 90vw",
        }}
        caption="A caption in the margin"
        rotate={-1.5}
        className="max-w-sm"
      />
    </div>
    <div className="mt-10 flex flex-wrap items-center gap-6">
      <TextLink href="/">Internal</TextLink>
      <TextLink href="https://lilispics.com" external>
        External
      </TextLink>
      <TextLink onClick={undefined} pressed>
        Button
      </TextLink>
    </div>
    <Rule className="my-10" />
    <WaxSeal className="mx-auto h-16 w-16" />
  </Tone>
);

export default async function KitPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="kit">
      <Kit tone="day" locale={locale} />
      <Kit tone="night" locale={locale} />
      <p className="container-site py-6">
        {MOMENT_TIMES.map((m) => formatTime(m, locale)).join(" · ")}
      </p>
    </main>
  );
}
