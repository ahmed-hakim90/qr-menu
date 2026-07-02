import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/components/landing-page";

export async function generateMetadata() {
  const t = await getTranslations("landing");
  return {
    title: t("hero"),
    description: t("heroSubtitle"),
  };
}

export default function HomePage() {
  return <LandingPage />;
}
