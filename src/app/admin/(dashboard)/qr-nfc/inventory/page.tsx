import { CardsInventoryManager } from "@/components/admin/cards-inventory-manager";

export default function QrInventoryPage() {
  return (
    <CardsInventoryManager
      mode="qr"
      title="QR Inventory"
      subtitle="Manage reusable QR codes — assign, unassign, and reassign without reprinting"
    />
  );
}
