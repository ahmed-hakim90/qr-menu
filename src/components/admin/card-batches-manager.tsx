"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CARD_TYPE_LABELS, formatDate } from "@/features/cards/card-labels";
import type { CardType } from "@/generated/prisma";

type BatchRow = {
  id: string;
  name: string;
  quantity: number;
  cardType: CardType;
  createdAt: string;
  _count: { cards: number };
};

export function CardBatchesManager() {
  const [batches, setBatches] = useState<BatchRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/cards/batches")
      .then((r) => r.json())
      .then((d) => setBatches(d.batches ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Card Batches</h1>
        <p className="text-sm text-muted-foreground">Bulk generation history</p>
      </div>

      <div className="grid gap-4">
        {batches.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No batches yet.</CardContent></Card>
        ) : (
          batches.map((batch) => (
            <Card key={batch.id}>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{batch.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(batch.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{CARD_TYPE_LABELS[batch.cardType]}</Badge>
                  <Badge>{batch._count.cards} / {batch.quantity} cards</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
