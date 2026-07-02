import { OrderBoard } from "@/components/orders/order-board";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Board</h1>
        <p className="text-sm text-muted-foreground">Track live orders across the service flow.</p>
      </div>
      <OrderBoard />
    </div>
  );
}
