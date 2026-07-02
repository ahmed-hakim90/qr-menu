"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
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
    <Button variant="ghost" size="sm" onClick={switchLocale} className="gap-1.5">
      <Globe className="h-4 w-4" />
      {locale === "ar" ? "EN" : "عربي"}
    </Button>
  );
}
