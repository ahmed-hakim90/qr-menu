import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { SetLocaleAttributes } from "@/components/set-locale-attributes";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages}>
        <SetLocaleAttributes />
        <ServiceWorkerRegister />
        {children}
        <Toaster richColors position="top-center" />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
