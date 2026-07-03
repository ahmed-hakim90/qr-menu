"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Branch, Restaurant } from "@/generated/prisma";
import { isOpenNow, parseWorkingHours } from "@/lib/working-hours";
import type { MenuThemeSlug } from "@/lib/menu-themes";
import { MenuTableActions } from "./menu-table-actions";

interface MenuHeaderProps {
  branch: Branch & { restaurant: Restaurant };
  locale: string;
  menuTheme?: MenuThemeSlug;
  tableNumber?: number;
  sessionId?: string | null;
  onRequestBill?: () => Promise<unknown>;
  onCallWaiter?: () => Promise<unknown>;
  reservationActions?: ReactNode;
  labels: {
    hours: string;
    contact: string;
    maps: string;
    review: string;
    reservationPhone: string;
  };
}

export function MenuHeader({
  branch,
  locale,
  menuTheme = "classic",
  tableNumber,
  sessionId,
  onRequestBill,
  onCallWaiter,
  reservationActions,
  labels,
}: MenuHeaderProps) {
  const name = locale === "ar" ? branch.nameAr : branch.nameEn;
  const restaurantName = locale === "ar" ? branch.restaurant.nameAr : branch.restaurant.nameEn;
  const description = locale === "ar" ? branch.restaurant.descriptionAr : branch.restaurant.descriptionEn;
  const hours = locale === "ar" ? branch.hoursAr : branch.hoursEn;
  const logo = branch.logo || branch.restaurant.logo;
  const coverImage = branch.coverImage || branch.restaurant.coverImage;
  const workingHours = parseWorkingHours(branch.workingHours);
  const openNow = workingHours ? isOpenNow(workingHours) : null;
  const mapsUrl =
    branch.googleMaps ||
    (branch.latitude && branch.longitude
      ? `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`
      : null);
  const isAntika = menuTheme === "antika";

  if (isAntika) {
    return (
      <div className="antika-header relative overflow-hidden bg-[#f5eee3] text-[#2a160f]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:gap-6 sm:py-8 lg:min-h-[420px] lg:grid-cols-[0.85fr_1.1fr_1fr] lg:items-center lg:gap-8 lg:py-10">
          <div className="relative flex min-h-56 items-center justify-center border-y-2 border-[#b67b31] bg-[#fffaf1] px-5 py-8 shadow-[inset_0_0_0_1px_rgba(182,123,49,0.25)] sm:min-h-64 lg:min-h-72 lg:px-6 lg:py-10">
            <div className="absolute inset-x-8 top-5 h-20 opacity-20 antika-ornament" />
            {logo && (
              <div className="relative h-28 w-52 sm:h-32 sm:w-60 lg:h-36 lg:w-64">
                <Image src={logo} alt={name} fill className="object-contain" priority sizes="(max-width: 640px) 208px, 256px" />
              </div>
            )}
            <div className="absolute bottom-5 text-center sm:bottom-7 lg:bottom-8">
              <p className="font-serif text-xl text-[#b67b31] sm:text-2xl">Menu</p>
              <p className="text-xs tracking-[0.32em] text-[#6f5640] sm:text-sm sm:tracking-[0.35em]">BEIRUT</p>
            </div>
          </div>

          {coverImage && (
            <div className="relative min-h-56 overflow-hidden border border-[#d7c7b2] bg-[#fffaf1] shadow-xl sm:min-h-72 lg:min-h-[340px]">
              <Image
                src={coverImage}
                alt={restaurantName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a160f]/45 via-transparent to-transparent" />
            </div>
          )}

          <div className="space-y-4 lg:space-y-5">
            <div>
              <p className="font-serif text-xl text-[#b67b31] sm:text-2xl">{restaurantName}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{name}</h1>
              {description && <p className="mt-3 max-w-xl text-sm leading-7 text-[#6f5640] sm:mt-4 sm:text-base">{description}</p>}
            </div>

            {hours && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6f5640] sm:text-sm">
                <Clock className="h-4 w-4 shrink-0 text-[#b67b31]" />
                <span>{labels.hours}: {hours}</span>
                {openNow !== null && (
                  <Badge variant={openNow ? "success" : "secondary"}>
                    {openNow ? (locale === "ar" ? "مفتوح الآن" : "Open now") : locale === "ar" ? "مغلق" : "Closed"}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {branch.whatsapp && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </a>
                </Button>
              )}
              {branch.phone && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={`tel:${branch.phone}`}>
                    <Phone className="h-4 w-4" />
                    {branch.phone}
                  </a>
                </Button>
              )}
              {mapsUrl && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4" />
                    {labels.maps}
                  </a>
                </Button>
              )}
              {!reservationActions && branch.reservationPhone && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={`tel:${branch.reservationPhone}`}>
                    <Phone className="h-4 w-4" />
                    {labels.reservationPhone}
                  </a>
                </Button>
              )}
              {branch.instagram && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={branch.instagram} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}
              {branch.facebook && (
                <Button variant="outline" size="sm" asChild className="h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm">
                  <a href={branch.facebook} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Facebook
                  </a>
                </Button>
              )}
            </div>

            {reservationActions}

            {tableNumber && onRequestBill && onCallWaiter && (
              <MenuTableActions
                locale={locale}
                menuTheme={menuTheme}
                sessionId={sessionId ?? null}
                onRequestBill={onRequestBill}
                onCallWaiter={onCallWaiter}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {(branch.coverImage || branch.restaurant.coverImage) ? (
          <Image
            src={branch.coverImage || branch.restaurant.coverImage!}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative -mt-16 px-4 pb-6"
      >
        <div className="flex items-end gap-4 mb-4">
          {logo && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-background shadow-xl">
              <Image
                src={logo}
                alt={name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="pb-1">
            <p className="text-sm text-muted-foreground">{restaurantName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>
          </div>
        </div>

        {description && (
          <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
        )}

        {hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{labels.hours}: {hours}</span>
            {openNow !== null && (
              <Badge variant={openNow ? "success" : "secondary"}>
                {openNow ? (locale === "ar" ? "مفتوح الآن" : "Open now") : (locale === "ar" ? "مغلق" : "Closed")}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {branch.whatsapp && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 text-green-500" />
                WhatsApp
              </a>
            </Button>
          )}
          {branch.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${branch.phone}`}>
                <Phone className="h-4 w-4" />
                {branch.phone}
              </a>
            </Button>
          )}
          {mapsUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
                {labels.maps}
              </a>
            </Button>
          )}
          {branch.googleReviewUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={branch.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                <Star className="h-4 w-4" />
                {labels.review}
              </a>
            </Button>
          )}
          {!reservationActions && branch.reservationPhone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${branch.reservationPhone}`}>
                <Phone className="h-4 w-4" />
                {labels.reservationPhone}
              </a>
            </Button>
          )}
          {branch.instagram && (
            <Button variant="outline" size="sm" asChild>
              <a href={branch.instagram} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
                Instagram
              </a>
            </Button>
          )}
          {branch.facebook && (
            <Button variant="outline" size="sm" asChild>
              <a href={branch.facebook} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
                Facebook
              </a>
            </Button>
          )}
        </div>

        {reservationActions}

        {tableNumber && onRequestBill && onCallWaiter && (
          <MenuTableActions
            locale={locale}
            menuTheme={menuTheme}
            sessionId={sessionId ?? null}
            onRequestBill={onRequestBill}
            onCallWaiter={onCallWaiter}
          />
        )}
      </motion.div>
    </div>
  );
}
