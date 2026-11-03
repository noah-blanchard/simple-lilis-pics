import type { Locale } from "@lili/core/i18n/routing";
import { SectionHeader } from "@lili/ui/components/SectionHeader";
import { getTranslations } from "next-intl/server";
import {
  HourByHourClient,
  type TimedMoment,
} from "@/components/HourByHourClient";
import { MOMENTS } from "@/data/moments";
import { PLACEHOLDERS } from "@/data/placeholder-photos";
import { type DayPart, formatTime } from "@/lib/format";

const PARTS: DayPart[] = ["morning", "afternoon", "evening", "night"];

// Resolves messages, times and photographs on the server, then hands plain
// props to the client component that runs the scroll clock.
export const HourByHour = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations({ locale, namespace: "day" });

  const moments: TimedMoment[] = MOMENTS.map((m) => {
    const photo = PLACEHOLDERS[m.photo];
    return {
      key: m.key,
      minutes: m.minutes,
      tone: m.tone,
      timeText: formatTime(m.minutes, locale),
      title: t(`moments.${m.key}.title`),
      line: t(`moments.${m.key}.line`),
      photo: { src: photo.src, alt: photo.alt[locale] },
      orientation: photo.orientation,
    };
  });

  const partLabels = Object.fromEntries(
    PARTS.map((p) => [p, t(`parts.${p}`)]),
  ) as Record<DayPart, string>;

  return (
    <HourByHourClient
      moments={moments}
      locale={locale}
      partLabels={partLabels}
      intro={t("intro")}
      header={
        <SectionHeader
          titleBase={t("titleBase")}
          titleAccent={t("titleAccent")}
          align="left"
          id="the-day-title"
        />
      }
    />
  );
};
