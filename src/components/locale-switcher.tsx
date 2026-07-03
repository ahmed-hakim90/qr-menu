"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LocaleSwitcherProps {
  showLabel?: boolean;
}

export function LocaleSwitcher({ showLabel = true }: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join("/") || "/";
    router.push(newPath === `/${newLocale}` && newLocale === "ar" ? "/" : newPath);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={switchLocale}
      className={showLabel ? "gap-1.5" : undefined}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      <Globe className="h-4 w-4" />
      {showLabel && (locale === "ar" ? "EN" : "عربي")}
    </Button>
  );
}
