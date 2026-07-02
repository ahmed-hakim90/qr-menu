"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";
import { useRestaurantRealtime } from "@/hooks/use-realtime";

type BoardOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  session: { table: { name: string; number: number } };
  items: Array<{ nameEn: string; quantity: number }>;
};

const columns = ["NEW", "PREPARING", "READY", "DELIVERED", "WAITING_BILL", "PAID"] as const;

export function OrderBoard() {
  const [orders, setOrders] = useState<BoardOrder[]>([]);

  const loadOrders = useCallback(async () => {
    const data = await apiRequest<BoardOrder[]>("/api/orders");
    setOrders(data);
  }, []);

  useDeferredEffect(() => {
    loadOrders().catch((error) => toast.error(error.message));
  }, [loadOrders]);

  useRestaurantRealtime(() => {
    loadOrders().catch(() => undefined);
  });

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {columns.map((status) => {
        const columnOrders = orders.filter((order) => order.status === status);
        return (
          <Card key={status} className="min-h-[420px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                {status.replace("_", " ")}
                <Badge>{columnOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{order.session.table.name}</p>
                    <span className="text-sm">{order.total.toFixed(2)}</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.quantity}x {item.nameEn}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {columns
                      .filter((next) => next !== order.status)
                      .slice(0, 3)
                      .map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(order.id, next)}
                        >
                          {next}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
