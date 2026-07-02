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
import type { Size } from "@/generated/prisma";

interface SizesManagerProps {
  sizes: Size[];
}

export function SizesManager({ sizes }: SizesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Size | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", priceModifier: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nameAr: "", nameEn: "", priceModifier: "0", isActive: true });
    setOpen(true);
  };

  const openEdit = (size: Size) => {
    setEditing(size);
    setForm({
      nameAr: size.nameAr,
      nameEn: size.nameEn,
      priceModifier: String(size.priceModifier),
      isActive: size.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, priceModifier: Number(form.priceModifier) };
      if (editing) {
        await apiRequest(`/api/sizes/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/sizes", {
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
        <h1 className="text-2xl font-bold">Sizes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Size
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Size" : "Add Size"}</DialogTitle>
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
                <Label>Extra Price (SAR)</Label>
                <Input type="number" step="0.01" value={form.priceModifier} onChange={(e) => setForm({ ...form, priceModifier: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sizes.map((size) => (
          <Card key={size.id}>
            <CardContent className="p-4 space-y-3">
              <div className="text-center">
                <h3 className="font-medium">{size.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{size.nameAr}</p>
                <p className="text-primary font-semibold mt-1">+{size.priceModifier} SAR</p>
              </div>
              <ToggleField
                id={size.id}
                label={size.isActive ? "Active" : "Inactive"}
                checked={size.isActive}
                field="isActive"
                endpoint={`/api/sizes/${size.id}`}
                onUpdated={refresh}
              />
              {!size.isActive && <Badge variant="secondary" className="w-full justify-center">Inactive</Badge>}
              <RowActions
                onEdit={() => openEdit(size)}
                onDelete={async () => {
                  await apiRequest(`/api/sizes/${size.id}`, { method: "DELETE" });
                  refresh();
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
