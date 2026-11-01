import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder until the wedding experience is designed. The portfolio origin
// is fixed on purpose: this page only exists to point visitors there.
const PORTFOLIO_ORIGIN = "https://lilispics.com";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const portfolioHref =
    locale === "fr" ? `${PORTFOLIO_ORIGIN}/fr` : PORTFOLIO_ORIGIN;

  return (
    <main className="container-site section-y flex min-h-dvh flex-col justify-center gap-6">
      <p className="tag-mono uppercase">{t("eyebrow")}</p>
      <h1 className="display-xl max-w-4xl text-[clamp(40px,6vw,88px)] text-fg">
        {t("title")}
      </h1>
      <p className="max-w-xl text-body-fluid text-fg/70">{t("body")}</p>
      <a
        href={portfolioHref}
        className="tag-mono w-fit text-accent-strong underline underline-offset-4"
      >
        {t("portfolioLink")}
      </a>
    </main>
  );
}
