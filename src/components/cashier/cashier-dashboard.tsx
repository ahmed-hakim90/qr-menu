"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";
import { CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";
import { useRestaurantRealtime } from "@/hooks/use-realtime";

type WaitingSession = {
  id: string;
  total: number;
  table: { name: string; number: number };
  orders: Array<{ id: string; total: number }>;
};

export function CashierDashboard() {
  const [sessions, setSessions] = useState<WaitingSession[]>([]);

  const loadSessions = useCallback(async () => {
    const data = await apiRequest<WaitingSession[]>("/api/payments");
    setSessions(data);
  }, []);

  useDeferredEffect(() => {
    loadSessions().catch((error) => toast.error(error.message));
  }, [loadSessions]);

  useRestaurantRealtime(() => {
    loadSessions().catch(() => undefined);
  });

  const pay = async (sessionId: string, provider: "CASH" | "PAYMOB") => {
    try {
      const payment = await apiRequest<{ providerCheckoutUrl?: string }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({ sessionId, provider }),
      });

      if (payment.providerCheckoutUrl) {
        window.open(payment.providerCheckoutUrl, "_blank");
      }

      toast.success(`${provider} payment started`);
      await loadSessions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{session.table.name}</h3>
                <p className="text-sm text-muted-foreground">#{session.table.number}</p>
              </div>
              <Badge variant="warning">Waiting Bill</Badge>
            </div>
            <p className="text-2xl font-bold">{session.total.toFixed(2)} EGP</p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => pay(session.id, "CASH")}>
                <Wallet className="h-4 w-4" />
                Cash
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => pay(session.id, "PAYMOB")}>
                <CreditCard className="h-4 w-4" />
                Paymob
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
