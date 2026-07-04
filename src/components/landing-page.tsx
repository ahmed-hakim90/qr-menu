"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Lenis from "lenis";
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
  Eye,
  Target,
  Lightbulb,
  Server,
  UtensilsCrossed,
  Coffee,
  Hotel,
  ChefHat,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import {
  Reveal,
  Stagger,
  StaggerItem,
  HeroParallax,
  FloatingOrb,
  GlassShine,
  MotionHeader,
  MobileMenuPanel,
  slideFromStart,
  slideFromEnd,
  scaleIn,
} from "@/components/landing/landing-motion";

const features = [
  { icon: QrCode, key: "qr" as const },
  { icon: Smartphone, key: "menu" as const },
  { icon: LayoutDashboard, key: "dashboard" as const },
  { icon: Globe, key: "multilingual" as const },
  { icon: Moon, key: "darkMode" as const },
  { icon: Zap, key: "fast" as const },
];

const techStack = [
  { icon: QrCode, key: "qr" as const },
  { icon: Smartphone, key: "pwa" as const },
  { icon: Server, key: "cloud" as const },
  { icon: LayoutDashboard, key: "ops" as const },
];

const customers = [
  { icon: UtensilsCrossed, key: "restaurants" as const },
  { icon: Coffee, key: "cafes" as const },
  { icon: Hotel, key: "hotels" as const },
  { icon: ChefHat, key: "cloudKitchens" as const },
  { icon: Truck, key: "foodTrucks" as const },
];

const navLinks = [
  { href: "#challenge", key: "challenge" as const },
  { href: "#about", key: "about" as const },
  { href: "#vision", key: "vision" as const },
  { href: "#solution", key: "solution" as const },
  { href: "#customers", key: "customers" as const },
];

const challengePairs = [
  { key: "menu" as const },
  { key: "operations" as const },
  { key: "growth" as const },
  { key: "competition" as const },
];

const heroEase = [0.22, 1, 0.36, 1] as const;

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: heroEase } },
};

export function LandingPage() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <MotionHeader className="fixed top-0 inset-x-0 z-50 liquid-glass border-b border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 h-14 sm:h-16">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 font-bold text-lg sm:text-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-8 sm:h-9 w-auto shrink-0" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, key }) => (
              <motion.a
                key={key}
                href={href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {t(`landing.nav.${key}`)}
              </motion.a>
            ))}
          </nav>

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
              <motion.div
                key={mobileMenuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </Button>
          </div>
        </div>

        <MobileMenuPanel open={mobileMenuOpen}>
          <div className="md:hidden border-t border-border/50 px-4 py-3">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, key }) => (
                <a
                  key={key}
                  href={href}
                  onClick={closeMobileMenu}
                  className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60"
                >
                  {t(`landing.nav.${key}`)}
                </a>
              ))}
              <Button variant="outline" asChild onClick={closeMobileMenu}>
                <Link href="/auth/login">{t("common.login")}</Link>
              </Button>
              <Button asChild onClick={closeMobileMenu}>
                <Link href="/auth/register">{t("common.register")}</Link>
              </Button>
            </div>
          </div>
        </MobileMenuPanel>
      </MotionHeader>

      <main className="pt-14 sm:pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/15" />
          <FloatingOrb
            className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-primary/20 landing-orb"
            duration={9}
          />
          <FloatingOrb
            className="absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-primary/10 landing-orb"
            duration={11}
            delay={1.5}
          />
          <FloatingOrb
            className="absolute top-1/2 end-1/4 h-48 w-48 rounded-full bg-primary/8 landing-orb hidden md:block"
            duration={7}
            delay={0.8}
          />

          <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 relative">
            <HeroParallax>
              <motion.div
                className="max-w-3xl"
                initial="hidden"
                animate="visible"
                variants={heroStagger}
              >
                <motion.p
                  variants={heroItem}
                  className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-1.5 text-sm font-medium text-primary mb-6"
                >
                  <motion.span
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <QrCode className="h-4 w-4" />
                  </motion.span>
                  {t("landing.badge")}
                </motion.p>
                <motion.h1
                  variants={heroItem}
                  className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6"
                >
                  {t("landing.hero")}
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl"
                >
                  {t("landing.heroSubtitle")}
                </motion.p>
                <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" asChild>
                      <Link href="/auth/register">
                        {t("common.getStarted")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" size="lg" asChild className="liquid-glass">
                      <a href="#challenge">{t("common.learnMore")}</a>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </HeroParallax>
          </div>
        </section>

        {/* Business Challenge & Solution */}
        <section id="challenge" className="scroll-mt-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <Reveal className="text-center mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-primary mb-3">{t("landing.challenge.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("landing.challenge.title")}</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t("landing.challenge.subtitle")}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <GlassShine className="rounded-3xl liquid-glass-strong p-6 sm:p-8 mb-10 sm:mb-14 landing-card-hover">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0"
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Building2 className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{t("landing.challenge.business.title")}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {t("landing.challenge.business.p1")}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t("landing.challenge.business.p2")}
                    </p>
                  </div>
                </div>
              </GlassShine>
            </Reveal>

            <Reveal className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6 px-2" delay={0.05}>
              <p className="text-sm font-semibold text-destructive/80 uppercase tracking-wide">
                {t("landing.challenge.problemLabel")}
              </p>
              <div className="w-8" />
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                {t("landing.challenge.solutionLabel")}
              </p>
            </Reveal>

            <div className="space-y-4 sm:space-y-5">
              {challengePairs.map(({ key }, index) => (
                <div
                  key={key}
                  className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-stretch"
                >
                  <Reveal variant={slideFromStart} delay={index * 0.08}>
                    <div className="rounded-2xl liquid-glass border border-destructive/15 bg-destructive/5 p-5 sm:p-6 h-full landing-card-hover">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive/70 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1.5">
                            {t(`landing.challenge.pairs.${key}.problem.title`)}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(`landing.challenge.pairs.${key}.problem.desc`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={index * 0.08 + 0.05} variant={scaleIn}>
                    <div className="hidden sm:flex items-center justify-center h-full">
                      <motion.div
                        className="flex h-10 w-10 items-center justify-center rounded-full liquid-glass text-primary"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </div>
                    <div className="flex sm:hidden items-center justify-center py-1">
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowDown className="h-5 w-5 text-primary" />
                      </motion.div>
                    </div>
                  </Reveal>

                  <Reveal variant={slideFromEnd} delay={index * 0.08 + 0.1}>
                    <div className="rounded-2xl liquid-glass-strong border border-primary/20 p-5 sm:p-6 h-full landing-card-hover">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1.5">
                            {t(`landing.challenge.pairs.${key}.solution.title`)}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(`landing.challenge.pairs.${key}.solution.desc`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            <Reveal delay={0.15}>
              <GlassShine className="mt-10 sm:mt-14 rounded-3xl liquid-glass-strong p-6 sm:p-8 text-center landing-card-hover">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary mx-auto mb-4"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="h-6 w-6" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{t("landing.challenge.outcome.title")}</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
                  {t("landing.challenge.outcome.desc")}
                </p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button asChild>
                    <Link href="/auth/register">
                      {t("landing.challenge.outcome.cta")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </GlassShine>
            </Reveal>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="scroll-mt-20 border-t border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <Reveal>
                <p className="text-sm font-semibold text-primary mb-3">{t("landing.about.label")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("landing.about.title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t("landing.about.p1")}</p>
                <p className="text-muted-foreground leading-relaxed">{t("landing.about.p2")}</p>
              </Reveal>
              <Stagger className="grid grid-cols-2 gap-4">
                {(["experience", "focus", "support", "local"] as const).map((key) => (
                  <StaggerItem key={key}>
                    <GlassShine className="rounded-2xl liquid-glass p-5 landing-card-hover h-full">
                      <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                        {t(`landing.about.stats.${key}.value`)}
                      </p>
                      <p className="text-sm text-muted-foreground">{t(`landing.about.stats.${key}.label`)}</p>
                    </GlassShine>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section id="vision" className="scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <Reveal className="text-center mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-primary mb-3">{t("landing.vision.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{t("landing.vision.title")}</h2>
            </Reveal>
            <Stagger className="grid md:grid-cols-2 gap-6">
              {(["vision", "mission"] as const).map((key) => (
                <StaggerItem key={key}>
                  <GlassShine className="group rounded-3xl liquid-glass p-8 landing-card-hover h-full">
                    <motion.div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {key === "vision" ? <Eye className="h-7 w-7" /> : <Target className="h-7 w-7" />}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">
                      {t(`landing.vision.${key === "vision" ? "visionTitle" : "missionTitle"}`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`landing.vision.${key === "vision" ? "visionText" : "missionText"}`)}
                    </p>
                  </GlassShine>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Recommendation */}
        <section className="border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <Reveal className="lg:col-span-2">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Lightbulb className="h-7 w-7" />
                </motion.div>
                <p className="text-sm font-semibold text-primary mb-3">{t("landing.recommend.label")}</p>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("landing.recommend.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("landing.recommend.subtitle")}</p>
              </Reveal>
              <Stagger className="lg:col-span-3 space-y-4">
                {(["instant", "cost", "experience", "control"] as const).map((key) => (
                  <StaggerItem key={key}>
                    <div className="flex gap-4 rounded-2xl liquid-glass p-5 landing-card-hover">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">{t(`landing.recommend.items.${key}.title`)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(`landing.recommend.items.${key}.desc`)}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Technical Solution */}
        <section id="solution" className="scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <Reveal className="text-center mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-primary mb-3">{t("landing.solution.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("landing.solution.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("landing.solution.subtitle")}</p>
            </Reveal>
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {techStack.map(({ icon: Icon, key }) => (
                <StaggerItem key={key}>
                  <GlassShine className="rounded-3xl liquid-glass p-6 text-center landing-card-hover h-full">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="font-semibold mb-2">{t(`landing.solution.stack.${key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`landing.solution.stack.${key}.desc`)}
                    </p>
                  </GlassShine>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-center">{t("landing.features.title")}</h3>
            </Reveal>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map(({ icon: Icon, key }) => (
                <StaggerItem key={key}>
                  <GlassShine className="group rounded-3xl liquid-glass p-6 landing-card-hover h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t(`landing.features.${key}`)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`landing.features.${key}Desc`)}
                    </p>
                  </GlassShine>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Customers */}
        <section id="customers" className="scroll-mt-20 border-t border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <Reveal className="text-center mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-primary mb-3">{t("landing.customers.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("landing.customers.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("landing.customers.subtitle")}</p>
            </Reveal>
            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {customers.map(({ icon: Icon, key }) => (
                <StaggerItem key={key}>
                  <GlassShine className="group rounded-3xl liquid-glass p-6 text-center landing-card-hover h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{t(`landing.customers.types.${key}.title`)}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                      {t(`landing.customers.types.${key}.desc`)}
                    </p>
                  </GlassShine>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
          <Reveal variant={scaleIn}>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-primary-foreground shadow-2xl shadow-primary/25">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/75" />
              <FloatingOrb className="absolute -top-16 -end-16 h-48 w-48 bg-white/20 landing-orb" duration={8} />
              <FloatingOrb className="absolute -bottom-20 -start-20 h-56 w-56 bg-white/10 landing-orb" duration={10} delay={1} />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t("landing.cta")}</h2>
                <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto">
                  {t("landing.ctaSubtitle")}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/auth/register">
                      {t("common.getStarted")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10 liquid-glass">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-8 w-auto opacity-80" />
              <p className="text-sm text-muted-foreground text-center sm:text-end max-w-md">
                {t("landing.footer.tagline")}
              </p>
            </div>
          </Reveal>
          <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
            © {new Date().getFullYear()} {t("common.appName")}. {t("landing.footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
