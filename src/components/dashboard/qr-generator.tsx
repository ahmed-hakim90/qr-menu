"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface BranchQR {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
}

export function QRGenerator({ branches }: { branches: BranchQR[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.slug || "");
  const [color, setColor] = useState("#000000");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/menu/${selectedBranch}`;

  useEffect(() => {
    if (!selectedBranch) return;
    QRCode.toCanvas(
      canvasRef.current,
      menuUrl,
      {
        width: 300,
        margin: 2,
        color: { dark: color, light: "#ffffff" },
      },
      (err) => {
        if (!err && canvasRef.current) {
          setQrDataUrl(canvasRef.current.toDataURL("image/png"));
        }
      }
    );
  }, [selectedBranch, color, menuUrl]);

  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${selectedBranch}.png`;
    a.click();
  };

  const downloadSVG = async () => {
    const svg = await QRCode.toString(menuUrl, {
      type: "svg",
      color: { dark: color, light: "#ffffff" },
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
          <CardTitle>QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Branch</Label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>QR Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-11 p-1 cursor-pointer"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground break-all">{menuUrl}</p>
          <div className="flex gap-2">
            <Button onClick={downloadPNG} size="sm">
              <Download className="h-4 w-4" />
              PNG
            </Button>
            <Button onClick={downloadSVG} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              SVG
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <canvas ref={canvasRef} className="rounded-2xl shadow-lg" />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Scan to open menu
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
