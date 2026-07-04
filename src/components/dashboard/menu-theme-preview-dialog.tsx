"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuThemeSlug } from "@/lib/menu-themes";

interface MenuThemePreviewDialogProps {
  themeSlug: MenuThemeSlug;
  themeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuThemePreviewDialog({
  themeSlug,
  themeName,
  open,
  onOpenChange,
}: MenuThemePreviewDialogProps) {
  const t = useTranslations("appearance");
  const locale = useLocale();
  const previewPath =
    locale === "ar" ? "/menu-preview" : `/${locale}/menu-preview`;
  const previewSrc = `${previewPath}?theme=${themeSlug}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,420px)] gap-4 overflow-hidden p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>{t("previewTitle", { theme: themeName })}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("previewHint")}</p>
        </DialogHeader>

        <div className="mx-auto w-full max-w-[375px]">
          <div className="overflow-hidden rounded-[2rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-2xl">
            <div className="h-[min(72vh,640px)] overflow-hidden bg-background">
              {open && (
                <iframe
                  title={t("previewTitle", { theme: themeName })}
                  src={previewSrc}
                  className="h-full w-full border-0 bg-background"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MenuThemePreviewButtonProps {
  themeSlug: MenuThemeSlug;
  themeName: string;
  className?: string;
}

export function MenuThemePreviewButton({
  themeSlug,
  themeName,
  className,
}: MenuThemePreviewButtonProps) {
  const t = useTranslations("appearance");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        {t("preview")}
      </Button>
      <MenuThemePreviewDialog
        themeSlug={themeSlug}
        themeName={themeName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
