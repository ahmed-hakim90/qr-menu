import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/components/landing-page";

export async function generateMetadata() {
  const t = await getTranslations("landing");
  return {
    title: t("hero"),
    description: t("heroSubtitle"),
    openGraph: {
      title: t("hero"),
      description: t("about.p1"),
    },
  };
}

export default function HomePage() {
  return <LandingPage />;
}
