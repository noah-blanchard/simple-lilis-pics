import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("hero");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-center">
      <p className="tag-mono uppercase">[{t("kicker")}]</p>
      <h1 className="display-xl text-5xl uppercase md:text-8xl">
        <span className="block">{t("titleLine1")}</span>
        <span className="block">{t("titleLine2")}</span>
      </h1>
      <p className="max-w-xl text-white/75">{t("intro")}</p>
    </main>
  );
}
