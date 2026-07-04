"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { formatDate } from "@/features/cards/card-labels";

type AssignmentRow = {
  id: string;
  assignedAt: string;
  active: boolean;
  card: { token: string; serialNumber: string; status: string };
  restaurant: { id: string; nameEn: string };
  branch: { id: string; nameEn: string };
  table: { id: string; number: number; name: string };
  assignedBy: { name: string } | null;
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

type AvailableCard = { id: string; serialNumber: string; token: string };

export function AssignmentsManager() {
  const router = useRouter();
  const [items, setItems] = useState<AssignmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [availableCards, setAvailableCards] = useState<AvailableCard[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [form, setForm] = useState({ cardId: "", restaurantId: "", branchId: "", tableId: "" });
  const limit = 20;

  const fetchAssignments = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await fetch(`/api/admin/cards/assignments?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [page]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (wizardOpen) {
      Promise.all([
        fetch("/api/admin/cards?status=AVAILABLE&limit=100").then((r) => r.json()),
        fetch("/api/admin/cards/restaurants").then((r) => r.json()),
      ]).then(([cards, rests]) => {
        setAvailableCards(cards.items ?? []);
        setRestaurants(rests);
      });
    }
  }, [wizardOpen]);

  const selectedRestaurant = restaurants.find((r) => r.id === form.restaurantId);
  const selectedBranch = selectedRestaurant?.branches.find((b) => b.id === form.branchId);

  async function confirmAssign() {
    try {
      const res = await fetch("/api/admin/cards/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Card assigned — restaurant can use it immediately");
      setWizardOpen(false);
      setStep(1);
      setForm({ cardId: "", restaurantId: "", branchId: "", tableId: "" });
      fetchAssignments();
      router.refresh();
    } catch {
      toast.error("Assignment failed");
    }
  }

  const columns: DataTableColumn<AssignmentRow>[] = [
    { key: "card", header: "Card", cell: (r) => <span className="font-mono text-xs">{r.card.serialNumber}</span> },
    { key: "token", header: "Token", cell: (r) => <span className="font-mono text-xs">{r.card.token}</span> },
    { key: "restaurant", header: "Restaurant", cell: (r) => r.restaurant.nameEn },
    { key: "branch", header: "Branch", cell: (r) => r.branch.nameEn },
    { key: "table", header: "Table", cell: (r) => `#${r.table.number}` },
    { key: "assigned", header: "Assigned At", cell: (r) => formatDate(r.assignedAt) },
    { key: "by", header: "Assigned By", cell: (r) => r.assignedBy?.name ?? "—" },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={r.active ? "success" : "secondary"}>{r.active ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-sm text-muted-foreground">Map cards to restaurants and tables — no QR reprint needed</p>
        </div>
        <Button onClick={() => { setWizardOpen(true); setStep(1); }}>Assign Card Wizard</Button>
      </div>

      <DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Filter assignments…" />

      <DataTable columns={columns} data={items} getRowId={(r) => r.id} />
      <DataTablePagination page={page} total={total} limit={limit} onPageChange={setPage} />

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Card — Step {step} of 4</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select an available card</p>
              <Select value={form.cardId} onChange={(e) => setForm((f) => ({ ...f, cardId: e.target.value }))}>
                <option value="">Select card</option>
                {availableCards.map((c) => (
                  <option key={c.id} value={c.id}>{c.serialNumber} — {c.token}</option>
                ))}
              </Select>
              <Button className="w-full" disabled={!form.cardId} onClick={() => setStep(2)}>Next</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Select value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value, branchId: "", tableId: "" })}>
                <option value="">Select restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.nameEn}</option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!form.restaurantId} onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Select value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value, tableId: "" }))}>
                <option value="">Select branch</option>
                {selectedRestaurant?.branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.nameEn}</option>
                ))}
              </Select>
              <Select value={form.tableId} onChange={(e) => setForm((f) => ({ ...f, tableId: e.target.value }))}>
                <option value="">Select table</option>
                {selectedBranch?.diningTables.map((t) => (
                  <option key={t.id} value={t.id}>Table #{t.number}</option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" disabled={!form.tableId} onClick={() => setStep(4)}>Next</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm">Confirm assignment. The card becomes active immediately — no QR regeneration or NFC rewrite.</p>
              <div className="rounded-xl border border-border/50 p-4 text-sm space-y-1">
                <p>Card: {availableCards.find((c) => c.id === form.cardId)?.serialNumber}</p>
                <p>Restaurant: {selectedRestaurant?.nameEn}</p>
                <p>Branch: {selectedBranch?.nameEn}</p>
                <p>Table: #{selectedBranch?.diningTables.find((t) => t.id === form.tableId)?.number}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button className="flex-1" onClick={confirmAssign}>Confirm Assignment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
