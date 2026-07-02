"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SocialPlatform = "instagram" | "facebook" | "whatsapp" | "phone";

const CONFIG: Record<
  SocialPlatform,
  { label: string; prefix?: string; placeholder: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }
> = {
  instagram: {
    label: "Instagram",
    prefix: "instagram.com/",
    placeholder: "username",
  },
  facebook: {
    label: "Facebook",
    prefix: "facebook.com/",
    placeholder: "page-name",
  },
  whatsapp: {
    label: "WhatsApp",
    prefix: "+",
    placeholder: "201234567890",
    inputMode: "tel",
  },
  phone: {
    label: "Phone",
    placeholder: "+201234567890",
    inputMode: "tel",
  },
};

function stripValue(platform: SocialPlatform, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (platform === "instagram") {
    return trimmed
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/\/$/, "");
  }

  if (platform === "facebook") {
    return trimmed
      .replace(/^https?:\/\/(www\.)?facebook\.com\//i, "")
      .replace(/\/$/, "");
  }

  if (platform === "whatsapp" || platform === "phone") {
    return trimmed.replace(/[^\d+]/g, "");
  }

  return trimmed;
}

export function toSocialUrl(platform: SocialPlatform, value: string): string {
  const stripped = stripValue(platform, value);
  if (!stripped) return "";

  switch (platform) {
    case "instagram":
      return `https://instagram.com/${stripped}`;
    case "facebook":
      return `https://facebook.com/${stripped}`;
    case "whatsapp":
      return stripped.replace(/^\+/, "");
    case "phone":
      return stripped;
    default:
      return stripped;
  }
}

export function fromSocialUrl(platform: SocialPlatform, value: string | null | undefined): string {
  if (!value) return "";
  return stripValue(platform, value);
}

interface SocialInputProps {
  platform: SocialPlatform;
  value: string;
  onChange: (value: string) => void;
}

export function SocialInput({ platform, value, onChange }: SocialInputProps) {
  const config = CONFIG[platform];

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <div className="flex rounded-2xl border border-border bg-background/50 overflow-hidden focus-within:ring-2 focus-within:ring-ring">
        {config.prefix && (
          <span className="px-3 py-2 text-sm text-muted-foreground border-e border-border/50 bg-muted/30 shrink-0 self-center">
            {config.prefix}
          </span>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(stripValue(platform, e.target.value))}
          placeholder={config.placeholder}
          inputMode={config.inputMode}
          className="border-0 rounded-none shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
