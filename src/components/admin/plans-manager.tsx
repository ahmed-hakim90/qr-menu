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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrencyAmount } from "@/lib/currency";
import type { Plan } from "@/generated/prisma";

type PlanRow = Plan & { _count: { subscriptions: number } };

interface PlansManagerProps {
  plans: PlanRow[];
}

const emptyForm = {
  slug: "",
  nameAr: "",
  nameEn: "",
  priceMonthly: "0",
  maxBranches: "1",
  maxProducts: "30",
  maxUsers: "2",
  customDomain: false,
  sortOrder: "0",
  isActive: true,
};

export function PlansManager({ plans }: PlansManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (plan: PlanRow) => {
    setEditing(plan);
    setForm({
      slug: plan.slug,
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      priceMonthly: String(plan.priceMonthly),
      maxBranches: String(plan.maxBranches),
      maxProducts: String(plan.maxProducts),
      maxUsers: String(plan.maxUsers),
      customDomain: plan.customDomain,
      sortOrder: String(plan.sortOrder),
      isActive: plan.isActive,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        priceMonthly: Number(form.priceMonthly),
        maxBranches: Number(form.maxBranches),
        maxProducts: Number(form.maxProducts),
        maxUsers: Number(form.maxUsers),
        sortOrder: Number(form.sortOrder),
      };

      const res = await fetch(
        editing ? `/api/admin/plans/${editing.id}` : "/api/admin/plans",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save plan");
      }
      setOpen(false);
      router.refresh();
      toast.success("Plan saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: PlanRow) => {
    if (!confirm(`Delete plan "${plan.nameEn}"?`)) return;
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete plan");
      }
      router.refresh();
      toast.success("Plan deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plans</h1>
          <p className="text-sm text-muted-foreground">Control prices and limits for every plan.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Plan" : "Add Plan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price / month</Label>
                  <Input type="number" step="0.01" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Max Branches</Label>
                  <Input type="number" value={form.maxBranches} onChange={(e) => setForm({ ...form, maxBranches: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Max Products</Label>
                  <Input type="number" value={form.maxProducts} onChange={(e) => setForm({ ...form, maxProducts: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.customDomain} onCheckedChange={(v) => setForm({ ...form, customDomain: v })} />
                Allow custom domain
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                Plan active (visible to tenants)
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{plan.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{plan.nameAr}</p>
                </div>
                <Badge variant={plan.isActive ? "success" : "secondary"}>
                  {plan.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="text-2xl font-bold">
                {plan.priceMonthly === 0 ? "Free" : formatCurrencyAmount(plan.priceMonthly)}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{plan.maxBranches} branches</li>
                <li>{plan.maxProducts} products</li>
                <li>{plan.maxUsers} users</li>
                <li>{plan.customDomain ? "Custom domain ✓" : "No custom domain"}</li>
                <li>{plan._count.subscriptions} active subscribers</li>
              </ul>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(plan)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
