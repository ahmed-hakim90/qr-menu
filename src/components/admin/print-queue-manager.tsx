"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { PRINT_QUEUE_STATUS_LABELS, PRINT_SHEET_LABELS, formatDate } from "@/features/cards/card-labels";
import type { PrintQueueStatus, PrintSheetType } from "@/generated/prisma";

type PrintItem = {
  id: string;
  sheetType: PrintSheetType;
  status: PrintQueueStatus;
  includeRestaurantName: boolean;
  includeTableNumber: boolean;
  createdAt: string;
  card: {
    token: string;
    serialNumber: string;
    qrImage: string | null;
    assignments: {
      restaurant: { nameEn: string };
      table: { number: number };
    }[];
  };
};

export function PrintQueueManager() {
  const router = useRouter();
  const [items, setItems] = useState<PrintItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchQueue = useCallback(async () => {
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/cards/print-queue${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  async function updateStatus(status: PrintQueueStatus) {
    if (selectedIds.size === 0) return;
    await fetch("/api/admin/cards/print-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selectedIds], status }),
    });
    toast.success(`Marked as ${status.toLowerCase()}`);
    setSelectedIds(new Set());
    fetchQueue();
    router.refresh();
  }

  const columns: DataTableColumn<PrintItem>[] = [
    {
      key: "qr",
      header: "QR",
      cell: (r) =>
        r.card.qrImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.card.qrImage} alt="QR" width={48} height={48} className="rounded" />
        ) : "—",
    },
    { key: "serial", header: "Card", cell: (r) => <span className="font-mono text-xs">{r.card.serialNumber}</span> },
    { key: "token", header: "Token", cell: (r) => <span className="font-mono text-xs">{r.card.token}</span> },
    { key: "sheet", header: "Sheet Type", cell: (r) => PRINT_SHEET_LABELS[r.sheetType] },
    { key: "restaurant", header: "Restaurant", cell: (r) => r.card.assignments[0]?.restaurant.nameEn ?? (r.includeRestaurantName ? "(on print)" : "—") },
    { key: "table", header: "Table", cell: (r) => r.card.assignments[0] ? `#${r.card.assignments[0].table.number}` : (r.includeTableNumber ? "(on print)" : "—") },
    { key: "status", header: "Status", cell: (r) => <Badge variant="secondary">{PRINT_QUEUE_STATUS_LABELS[r.status]}</Badge> },
    { key: "created", header: "Queued", cell: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Print Queue</h1>
        <p className="text-sm text-muted-foreground">A4 sheets, labels, stickers, PVC cards, and stands</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">All</option>
          {Object.entries(PRINT_QUEUE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        {selectedIds.size > 0 && (
          <>
            <Button size="sm" variant="outline" onClick={() => updateStatus("PROCESSING")}>Processing</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus("COMPLETED")}>Completed</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus("CANCELLED")}>Cancel</Button>
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(r) => r.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
