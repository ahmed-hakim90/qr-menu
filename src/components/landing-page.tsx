"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  QrCode,
  Smartphone,
  LayoutDashboard,
  Globe,
  Moon,
  Zap,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

const features = [
  { icon: QrCode, key: "qr" as const },
  { icon: Smartphone, key: "menu" as const },
  { icon: LayoutDashboard, key: "dashboard" as const },
  { icon: Globe, key: "multilingual" as const },
  { icon: Moon, key: "darkMode" as const },
  { icon: Zap, key: "fast" as const },
];

export function LandingPage() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 h-14 sm:h-16">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-lg sm:text-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-7 w-7 shrink-0" />
            <span className="truncate">{t("common.appName")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">{t("common.login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">{t("common.register")}</Link>
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-0.5">
            <LocaleSwitcher showLabel={false} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3">
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/login">{t("common.login")}</Link>
              </Button>
              <Button asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/register">{t("common.register")}</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-14 sm:pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 relative">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
                {t("landing.hero")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                {t("landing.heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    {t("common.getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">{t("common.dashboard")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            {t("landing.features.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="group rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t(`landing.features.${key}`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`landing.features.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-10 md:p-12 text-primary-foreground shadow-2xl shadow-primary/25">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t("landing.cta")}</h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto">
              {t("landing.heroSubtitle")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                {t("common.getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QR Menu. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
