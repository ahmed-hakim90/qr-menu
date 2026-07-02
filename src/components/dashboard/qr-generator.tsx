"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BranchQR {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
}

interface QRGeneratorProps {
  branches: BranchQR[];
  restaurantName: string;
  restaurantNameAr: string;
}

type TemplateId = "modern" | "dark" | "minimal" | "gradient";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "dark", label: "Dark" },
  { id: "minimal", label: "Minimal" },
  { id: "gradient", label: "Gradient" },
];

const CANVAS_W = 1080;
const CANVAS_H = 1440;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function QRGenerator({
  branches,
  restaurantName,
  restaurantNameAr,
}: QRGeneratorProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.slug || "");
  const [accent, setAccent] = useState("#e94560");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [headline, setHeadline] = useState("Scan to view our menu");
  const [headlineAr, setHeadlineAr] = useState("امسح الكود لعرض المنيو");
  const [displayName, setDisplayName] = useState(restaurantName);
  const [displayNameAr, setDisplayNameAr] = useState(restaurantNameAr);

  const branch = branches.find((b) => b.slug === selectedBranch);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${origin}/menu/${selectedBranch}`;

  const drawPoster = useCallback(
    async (ctx: CanvasRenderingContext2D) => {
      const isDark = template === "dark";
      const bg = isDark ? "#0f1020" : "#ffffff";
      const textColor = isDark ? "#ffffff" : "#111122";
      const subColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)";

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background
      if (template === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
        grad.addColorStop(0, accent);
        grad.addColorStop(1, "#1a1a2e");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg;
      }
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const onColor = template === "gradient" ? "#ffffff" : textColor;
      const onSub = template === "gradient" ? "rgba(255,255,255,0.85)" : subColor;

      // Top accent bar (modern)
      if (template === "modern") {
        ctx.fillStyle = accent;
        ctx.fillRect(0, 0, CANVAS_W, 24);
      }

      // Restaurant name
      ctx.textAlign = "center";
      ctx.fillStyle = onColor;
      ctx.font = "bold 78px Arial, sans-serif";
      ctx.fillText(displayName, CANVAS_W / 2, 200);

      ctx.fillStyle = onSub;
      ctx.font = "44px Arial, sans-serif";
      ctx.fillText(displayNameAr, CANVAS_W / 2, 270);

      // QR card
      const qrSize = 640;
      const cardPad = 60;
      const cardW = qrSize + cardPad * 2;
      const cardX = (CANVAS_W - cardW) / 2;
      const cardY = 360;
      const cardH = cardW;

      // Card shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 24;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, cardX, cardY, cardW, cardH, 56);
      ctx.fill();
      ctx.restore();

      // QR image
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: qrSize,
        margin: 1,
        color: { dark: template === "gradient" ? "#1a1a2e" : accent, light: "#ffffff" },
        errorCorrectionLevel: "H",
      });

      const qrImg = await loadImage(qrDataUrl);
      ctx.drawImage(qrImg, cardX + cardPad, cardY + cardPad, qrSize, qrSize);

      // Center badge circle
      const badgeR = 70;
      const badgeCx = CANVAS_W / 2;
      const badgeCy = cardY + cardH / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(badgeCx, badgeCy, badgeR - 14, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Arial, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("QR", badgeCx, badgeCy + 2);
      ctx.textBaseline = "alphabetic";
      ctx.restore();

      // Headlines
      const headY = cardY + cardH + 130;
      ctx.fillStyle = onColor;
      ctx.font = "bold 60px Arial, sans-serif";
      ctx.fillText(headline, CANVAS_W / 2, headY);

      ctx.fillStyle = onSub;
      ctx.font = "46px Arial, sans-serif";
      ctx.fillText(headlineAr, CANVAS_W / 2, headY + 74);

      // Pill with branch name
      if (branch) {
        const pillText = branch.nameEn;
        ctx.font = "bold 40px Arial, sans-serif";
        const textW = ctx.measureText(pillText).width;
        const pillW = textW + 96;
        const pillH = 92;
        const pillX = (CANVAS_W - pillW) / 2;
        const pillY = headY + 130;
        ctx.fillStyle = accent;
        roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(pillText, CANVAS_W / 2, pillY + pillH / 2 + 2);
        ctx.textBaseline = "alphabetic";
      }
    },
    [
      template,
      accent,
      displayName,
      displayNameAr,
      menuUrl,
      headline,
      headlineAr,
      branch,
    ]
  );

  useEffect(() => {
    if (!selectedBranch) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPoster(ctx);
  }, [selectedBranch, drawPoster]);

  const downloadPoster = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await drawPoster(ctx);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-poster-${selectedBranch}.png`;
    a.click();
  };

  const downloadPlainPNG = async () => {
    const dataUrl = await QRCode.toDataURL(menuUrl, {
      width: 1024,
      margin: 2,
      color: { dark: accent, light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${selectedBranch}.png`;
    a.click();
  };

  const downloadSVG = async () => {
    const svg = await QRCode.toString(menuUrl, {
      type: "svg",
      color: { dark: accent, light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${selectedBranch}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Designed QR Poster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.nameEn}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                    template === t.id
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-16 h-11 p-1 cursor-pointer"
              />
              <Input
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cafe Name (English)</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cafe Name (Arabic)</Label>
            <Input value={displayNameAr} onChange={(e) => setDisplayNameAr(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Headline (English)</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Headline (Arabic)</Label>
            <Input value={headlineAr} onChange={(e) => setHeadlineAr(e.target.value)} />
          </div>

          <p className="text-sm text-muted-foreground break-all">{menuUrl}</p>

          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadPoster} size="sm">
              <Download className="h-4 w-4" />
              Poster PNG
            </Button>
            <Button onClick={downloadPlainPNG} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              QR PNG
            </Button>
            <Button onClick={downloadSVG} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              QR SVG
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <canvas
            ref={previewRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full max-w-[320px] rounded-2xl shadow-xl border border-border/50"
          />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Live preview — download prints at {CANVAS_W}×{CANVAS_H}px
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
