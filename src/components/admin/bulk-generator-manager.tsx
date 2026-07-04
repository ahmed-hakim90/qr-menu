"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARD_TYPE_LABELS } from "@/features/cards/card-labels";
import type { CardType } from "@/generated/prisma";

const PRESETS = [10, 50, 100, 500, 1000] as const;

export function BulkGeneratorManager() {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(10);
  const [cardType, setCardType] = useState<CardType>("QR_ONLY");
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ batch: { name: string; quantity: number }; cards: { length: number } } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cards/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          cardType,
          batchName: batchName || undefined,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setLastResult(data);
      toast.success(`Generated ${data.cards.length} cards`);
      router.refresh();
    } catch {
      toast.error("Failed to generate cards");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate cards with unique UUID, token, QR image, secret key, and print code
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((n) => (
                <Button
                  key={n}
                  variant={quantity === n ? "default" : "outline"}
                  onClick={() => setQuantity(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="max-w-xs mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Card Type</Label>
            <Select
              value={cardType}
              onChange={(e) => setCardType(e.target.value as CardType)}
              className="max-w-xs"
            >
              {Object.entries(CARD_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Batch Name (optional)</Label>
            <Input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder={`Batch ${new Date().toISOString().slice(0, 10)}`}
              className="max-w-md"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} size="lg">
            {loading ? "Generating…" : `Generate ${quantity} Cards`}
          </Button>

          {lastResult && (
            <div className="rounded-xl border border-border/50 p-4 bg-muted/30">
              <p className="font-medium">Last batch: {lastResult.batch.name}</p>
              <p className="text-sm text-muted-foreground">{lastResult.cards.length} cards created</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/50 p-4 text-sm text-muted-foreground space-y-1">
        <p>Each card includes:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Unique UUID and secure token (no restaurant IDs)</li>
          <li>QR image encoding <code className="text-xs">https://menu.yourdomain.com/s/&#123;TOKEN&#125;</code></li>
          <li>Secret validation key and print code</li>
          <li>Stored in platform inventory as Available</li>
        </ul>
      </div>
    </div>
  );
}
