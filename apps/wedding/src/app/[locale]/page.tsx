import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageTop } from "@/components/PageTop";
import { renderAccentLine } from "@/lib/accent";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hero" });

  return (
    <>
      <PageTop />
      <main id="main" className="container-site section-y">
        {/* Phase 07 replaces this with the invitation and the day half. */}
        <h1 className="display-xl text-center text-[clamp(40px,6vw,88px)]">
          {renderAccentLine(t("title"))}
        </h1>
      </main>
    </>
  );
}
