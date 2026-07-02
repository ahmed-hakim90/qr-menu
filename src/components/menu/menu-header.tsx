"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Branch, Restaurant } from "@/generated/prisma";

interface MenuHeaderProps {
  branch: Branch & { restaurant: Restaurant };
  locale: string;
  labels: {
    hours: string;
    contact: string;
  };
}

export function MenuHeader({ branch, locale, labels }: MenuHeaderProps) {
  const name = locale === "ar" ? branch.nameAr : branch.nameEn;
  const restaurantName = locale === "ar" ? branch.restaurant.nameAr : branch.restaurant.nameEn;
  const description = locale === "ar" ? branch.restaurant.descriptionAr : branch.restaurant.descriptionEn;
  const hours = locale === "ar" ? branch.hoursAr : branch.hoursEn;
  const logo = branch.logo || branch.restaurant.logo;

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
          {branch.googleMaps && (
            <Button variant="outline" size="sm" asChild>
              <a href={branch.googleMaps} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
                Maps
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
      </motion.div>
    </div>
  );
}
