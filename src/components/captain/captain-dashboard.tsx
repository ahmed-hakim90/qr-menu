"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";
import { useRestaurantRealtime } from "@/hooks/use-realtime";

type CaptainOrder = {
  id: string;
  status: string;
  total: number;
  session: { table: { name: string } };
  items: Array<{ nameEn: string; quantity: number }>;
};

const nextStatuses = ["PREPARING", "READY", "DELIVERED"] as const;

export function CaptainDashboard() {
  const [orders, setOrders] = useState<CaptainOrder[]>([]);

  const loadOrders = useCallback(async () => {
    const data = await apiRequest<CaptainOrder[]>("/api/orders?view=captain");
    setOrders(data);
  }, []);

  useDeferredEffect(() => {
    loadOrders().catch((error) => toast.error(error.message));
  }, [loadOrders]);

  useRestaurantRealtime(() => {
    loadOrders().catch(() => undefined);
  });

  const updateStatus = async (orderId: string, status: string) => {
    await apiRequest(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadOrders();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{order.session.table.name}</h3>
              <Badge>{order.status}</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {order.items.map((item, index) => (
                <li key={`${order.id}-${index}`}>
                  {item.quantity}x {item.nameEn}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(order.id, status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
