"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Download, Link2Off, Printer, RefreshCw, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  CARD_STATUS_LABELS,
  CARD_TYPE_LABELS,
  exportToCsv,
  formatDate,
  statusBadgeVariant,
} from "@/features/cards/card-labels";
import type { CardStatus, CardType } from "@/generated/prisma";

type AssignmentInfo = {
  restaurant: { id: string; nameEn: string };
  branch: { id: string; nameEn: string };
  table: { id: string; number: number; name: string };
  assignedAt: string;
};

type CardRow = {
  id: string;
  token: string;
  serialNumber: string;
  cardType: CardType;
  status: CardStatus;
  qrImage: string | null;
  nfcUid: string | null;
  scanCount: number;
  lastScanAt: string | null;
  createdAt: string;
  assignments: AssignmentInfo[];
};

type RestaurantOption = {
  id: string;
  nameEn: string;
  branches: {
    id: string;
    nameEn: string;
    diningTables: { id: string; number: number; name: string }[];
  }[];
};

interface CardsInventoryManagerProps {
  mode: "qr" | "nfc" | "all";
  title: string;
  subtitle: string;
}

export function CardsInventoryManager({ mode, title, subtitle }: CardsInventoryManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<CardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [assignCard, setAssignCard] = useState<CardRow | null>(null);
  const [viewCard, setViewCard] = useState<CardRow | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [assignForm, setAssignForm] = useState({ restaurantId: "", branchId: "", tableId: "" });

  const limit = 20;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (mode === "qr") params.set("qrOnly", "true");
    if (mode === "nfc") params.set("nfcOnly", "true");

    const res = await fetch(`/api/admin/cards?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, statusFilter, mode]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    fetch("/api/admin/cards/restaurants")
      .then((r) => r.json())
      .then(setRestaurants);
  }, []);

  async function cardAction(id: string, action: string, extra?: Record<string, string>) {
    try {
      const res = await fetch(`/api/admin/cards/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Action failed");
      toast.success(`Card ${action.replace("-", " ")} successful`);
      fetchCards();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  }

  async function handleAssign() {
    if (!assignCard) return;
    await cardAction(assignCard.id, "assign", assignForm);
    setAssignCard(null);
    setAssignForm({ restaurantId: "", branchId: "", tableId: "" });
  }

  async function bulkAction(action: "disable" | "unassign") {
    if (selectedIds.size === 0) return;
    try {
      await fetch("/api/admin/cards/bulk-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], action }),
      });
      toast.success(`Bulk ${action} completed`);
      setSelectedIds(new Set());
      fetchCards();
    } catch {
      toast.error("Bulk action failed");
    }
  }

  function handleExport() {
    exportToCsv(
      `cards-${mode}-${Date.now()}.csv`,
      ["Serial", "Token", "Status", "Type", "Restaurant", "Branch", "Table", "Last Scan"],
      items.map((c) => {
        const a = c.assignments[0];
        return [
          c.serialNumber,
          c.token,
          c.status,
          c.cardType,
          a?.restaurant.nameEn ?? "",
          a?.branch.nameEn ?? "",
          a ? String(a.table.number) : "",
          c.lastScanAt ?? "",
        ];
      })
    );
  }

  const selectedRestaurant = restaurants.find((r) => r.id === assignForm.restaurantId);
  const selectedBranch = selectedRestaurant?.branches.find((b) => b.id === assignForm.branchId);

  const columns: DataTableColumn<CardRow>[] = [
    {
      key: "serial",
      header: "Card #",
      cell: (row) => <span className="font-mono text-xs">{row.serialNumber}</span>,
    },
    {
      key: "token",
      header: "Token",
      cell: (row) => <span className="font-mono text-xs">{row.token}</span>,
    },
    ...(mode !== "nfc"
      ? [
          {
            key: "qr",
            header: "QR",
            cell: (row: CardRow) =>
              row.qrImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.qrImage} alt="QR" width={40} height={40} className="rounded" />
              ) : (
                "—"
              ),
          } satisfies DataTableColumn<CardRow>,
        ]
      : []),
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusBadgeVariant(row.status)}>{CARD_STATUS_LABELS[row.status]}</Badge>
      ),
    },
    {
      key: "restaurant",
      header: "Restaurant",
      cell: (row) => row.assignments[0]?.restaurant.nameEn ?? "—",
    },
    {
      key: "branch",
      header: "Branch",
      cell: (row) => row.assignments[0]?.branch.nameEn ?? "—",
    },
    {
      key: "table",
      header: "Table",
      cell: (row) =>
        row.assignments[0] ? `#${row.assignments[0].table.number}` : "—",
    },
    {
      key: "created",
      header: "Created",
      cell: (row) => <span className="text-xs">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "assigned",
      header: "Assigned At",
      cell: (row) => <span className="text-xs">{formatDate(row.assignments[0]?.assignedAt)}</span>,
    },
    {
      key: "lastScan",
      header: "Last Scan",
      cell: (row) => <span className="text-xs">{formatDate(row.lastScanAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setViewCard(row)}>
            View
          </Button>
          {row.status === "AVAILABLE" && (
            <Button variant="ghost" size="sm" onClick={() => setAssignCard(row)}>
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
          )}
          {row.status === "ASSIGNED" && (
            <Button variant="ghost" size="sm" onClick={() => cardAction(row.id, "unassign")}>
              <Link2Off className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => cardAction(row.id, "disable")}>
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => cardAction(row.id, "regenerate-qr")}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await fetch("/api/admin/cards/print-queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardIds: [row.id] }),
              });
              toast.success("Added to print queue");
            }}
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-40"
        >
          <option value="all">All statuses</option>
          {Object.entries(CARD_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        {selectedIds.size > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => bulkAction("unassign")}>
              Unassign ({selectedIds.size})
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction("disable")}>
              Disable ({selectedIds.size})
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DataTableToolbar>

      {loading ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={items}
            getRowId={(r) => r.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          <DataTablePagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Dialog open={!!assignCard} onOpenChange={() => setAssignCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Card {assignCard?.serialNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={assignForm.restaurantId}
              onChange={(e) => setAssignForm({ restaurantId: e.target.value, branchId: "", tableId: "" })}
            >
              <option value="">Select restaurant</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.nameEn}</option>
              ))}
            </Select>
            <Select
              value={assignForm.branchId}
              onChange={(e) => setAssignForm((f) => ({ ...f, branchId: e.target.value, tableId: "" }))}
              disabled={!assignForm.restaurantId}
            >
              <option value="">Select branch</option>
              {selectedRestaurant?.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.nameEn}</option>
              ))}
            </Select>
            <Select
              value={assignForm.tableId}
              onChange={(e) => setAssignForm((f) => ({ ...f, tableId: e.target.value }))}
              disabled={!assignForm.branchId}
            >
              <option value="">Select table</option>
              {selectedBranch?.diningTables.map((t) => (
                <option key={t.id} value={t.id}>Table #{t.number} — {t.name}</option>
              ))}
            </Select>
            <Button
              className="w-full"
              disabled={!assignForm.tableId}
              onClick={handleAssign}
            >
              Confirm Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCard} onOpenChange={() => setViewCard(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Card Details</DialogTitle>
          </DialogHeader>
          {viewCard && (
            <div className="space-y-4">
              {viewCard.qrImage && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewCard.qrImage} alt="QR" width={160} height={160} className="rounded-xl" />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Token</dt><dd className="font-mono">{viewCard.token}</dd></div>
                <div><dt className="text-muted-foreground">Serial</dt><dd className="font-mono">{viewCard.serialNumber}</dd></div>
                <div><dt className="text-muted-foreground">Type</dt><dd>{CARD_TYPE_LABELS[viewCard.cardType]}</dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd>{CARD_STATUS_LABELS[viewCard.status]}</dd></div>
                <div><dt className="text-muted-foreground">Total Scans</dt><dd>{viewCard.scanCount}</dd></div>
                <div><dt className="text-muted-foreground">Last Scan</dt><dd>{formatDate(viewCard.lastScanAt)}</dd></div>
                {viewCard.nfcUid && (
                  <div className="col-span-2"><dt className="text-muted-foreground">NFC UID</dt><dd className="font-mono">{viewCard.nfcUid}</dd></div>
                )}
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
