"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RowActions, ToggleField } from "./entity-actions";
import { apiRequest } from "@/lib/dashboard-api";
import { formatPrice } from "@/lib/utils";
import type { Addon } from "@/generated/prisma";

interface AddonsManagerProps {
  addons: Addon[];
  currencySymbol?: string;
}

export function AddonsManager({ addons, currencySymbol = "ر.س" }: AddonsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", price: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nameAr: "", nameEn: "", price: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (addon: Addon) => {
    setEditing(addon);
    setForm({
      nameAr: addon.nameAr,
      nameEn: addon.nameEn,
      price: String(addon.price),
      isActive: addon.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await apiRequest(`/api/addons/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/addons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setOpen(false);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add-ons</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Add-on
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {addons.map((addon) => (
          <Card key={addon.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div>
                <h3 className="font-medium">{addon.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{addon.nameAr}</p>
                <p className="font-semibold text-primary mt-1">+{formatPrice(addon.price, currencySymbol)}</p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <ToggleField
                  id={addon.id}
                  label={addon.isActive ? "Active" : "Inactive"}
                  checked={addon.isActive}
                  field="isActive"
                  endpoint={`/api/addons/${addon.id}`}
                  onUpdated={refresh}
                />
                {!addon.isActive && <Badge variant="secondary">Inactive</Badge>}
                <RowActions
                  onEdit={() => openEdit(addon)}
                  onDelete={async () => {
                    await apiRequest(`/api/addons/${addon.id}`, { method: "DELETE" });
                    refresh();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
