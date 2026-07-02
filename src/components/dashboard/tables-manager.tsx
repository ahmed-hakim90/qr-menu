"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/dashboard-api";
import { RowActions } from "./entity-actions";
import type { Branch, DiningTable } from "@/generated/prisma";

type TableRow = DiningTable & {
  branch: Pick<Branch, "id" | "nameAr" | "nameEn" | "slug">;
};

interface TablesManagerProps {
  tables: TableRow[];
  branches: Pick<Branch, "id" | "nameAr" | "nameEn" | "slug">[];
}

const emptyForm = {
  branchId: "",
  name: "",
  number: "1",
  seats: "",
  isActive: true,
};

function tableUrl(branchSlug: string, tableNumber: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/menu/${branchSlug}?table=${tableNumber}`;
}

export function TablesManager({ tables, branches }: TablesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TableRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ...emptyForm,
    branchId: branches[0]?.id ?? "",
  });

  const branchById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch])),
    [branches]
  );

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, branchId: branches[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (table: TableRow) => {
    setEditing(table);
    setForm({
      branchId: table.branchId,
      name: table.name,
      number: String(table.number),
      seats: table.seats ? String(table.seats) : "",
      isActive: table.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        branchId: form.branchId,
        name: form.name,
        number: Number(form.number),
        seats: form.seats ? Number(form.seats) : null,
        isActive: form.isActive,
      };

      if (editing) {
        await apiRequest(`/api/tables/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/tables", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setOpen(false);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save table");
    } finally {
      setSaving(false);
    }
  };

  const copyTableLink = async (table: TableRow) => {
    await navigator.clipboard.writeText(tableUrl(table.branch.slug, table.number));
    toast.success("Table QR link copied");
  };

  if (branches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Tables</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a branch before creating table QR codes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tables</h1>
          <p className="text-sm text-muted-foreground">
            Create table QR links for dine-in menus and future table ordering.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Table" : "Add Table"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={form.branchId}
                  onChange={(event) => setForm({ ...form, branchId: event.target.value })}
                  required
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.nameEn} / {branch.nameAr}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Table 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.number}
                    onChange={(event) => setForm({ ...form, number: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(event) => setForm({ ...form, seats: event.target.value })}
                  placeholder="Optional"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(value) => setForm({ ...form, isActive: value })}
                />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tables.map((table) => {
          const branch = branchById.get(table.branchId) ?? table.branch;
          return (
            <Card key={table.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{table.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      #{table.number} - {branch.nameEn}
                    </p>
                  </div>
                  <Badge variant={table.isActive ? "success" : "secondary"}>
                    {table.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Status: {table.status}</p>
                  <p>Seats: {table.seats ?? "Not set"}</p>
                  <p className="truncate">QR: /menu/{branch.slug}?table={table.number}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyTableLink(table)}>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <RowActions
                    onEdit={() => openEdit(table)}
                    onDelete={async () => {
                      await apiRequest(`/api/tables/${table.id}`, { method: "DELETE" });
                      refresh();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
