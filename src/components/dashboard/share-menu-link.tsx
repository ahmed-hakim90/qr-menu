"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { buildMenuUrl } from "@/lib/menu-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type BranchOption = {
  slug: string;
  nameEn: string;
  nameAr: string;
};

interface ShareMenuLinkProps {
  branches: BranchOption[];
  subdomain?: string | null;
  customDomain?: string | null;
}

export function ShareMenuLink({ branches, subdomain, customDomain }: ShareMenuLinkProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [selectedSlug, setSelectedSlug] = useState(branches[0]?.slug ?? "");

  const menuUrl = useMemo(() => {
    if (!selectedSlug) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    return buildMenuUrl({
      branchSlug: selectedSlug,
      subdomain,
      customDomain,
      origin,
    });
  }, [selectedSlug, subdomain, customDomain]);

  const branchLabel = (branch: BranchOption) =>
    locale === "ar" ? branch.nameAr || branch.nameEn : branch.nameEn;

  const copyLink = async () => {
    if (!menuUrl) return;
    await navigator.clipboard.writeText(menuUrl);
    toast.success(tCommon("copied"));
  };

  const shareLink = async () => {
    if (!menuUrl) return;
    if (navigator.share) {
      await navigator.share({ title: t("menuLink"), url: menuUrl });
      return;
    }
    await copyLink();
  };

  if (branches.length === 0) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          {t("menuLinkEmpty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Link2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{t("menuLink")}</p>
            <p className="text-sm text-muted-foreground">{t("menuLinkHint")}</p>
          </div>
        </div>

        {branches.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="share-branch">{t("selectBranch")}</Label>
            <Select
              id="share-branch"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
            >
              {branches.map((branch) => (
                <option key={branch.slug} value={branch.slug}>
                  {branchLabel(branch)}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            readOnly
            value={menuUrl}
            className="font-mono text-sm bg-background"
            onFocus={(e) => e.target.select()}
          />
          <div className="flex shrink-0 gap-2">
            <Button type="button" onClick={copyLink} className="gap-2">
              <Copy className="h-4 w-4" />
              {tCommon("copyLink")}
            </Button>
            <Button type="button" variant="outline" onClick={shareLink} className="gap-2">
              <Share2 className="h-4 w-4" />
              {tCommon("share")}
            </Button>
            <Button type="button" variant="outline" size="icon" asChild>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">{t("openMenu")}</span>
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
