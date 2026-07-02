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
import { ImageUpload } from "./image-upload";
import { apiRequest } from "@/lib/dashboard-api";
import type { Category } from "@/generated/prisma";

type CategoryWithCount = Category & { _count: { products: number } };

interface CategoriesManagerProps {
  categories: CategoryWithCount[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", image: "", isVisible: true });
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nameAr: "", nameEn: "", image: "", isVisible: true });
    setOpen(true);
  };

  const openEdit = (category: CategoryWithCount) => {
    setEditing(category);
    setForm({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      image: category.image || "",
      isVisible: category.isVisible,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/categories/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest("/api/categories", {
          method: "POST",
          body: JSON.stringify(form),
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
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
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
              <ImageUpload
                label="Category Image"
                aspect="wide"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {categories.map((cat, i) => (
          <Card key={cat.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm w-8">{i + 1}</span>
                <div>
                  <h3 className="font-medium">{cat.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{cat.nameAr}</p>
                  <p className="text-sm text-muted-foreground mt-1">{cat._count.products} products</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <ToggleField
                  id={cat.id}
                  label={cat.isVisible ? "Visible" : "Hidden"}
                  checked={cat.isVisible}
                  field="isVisible"
                  endpoint={`/api/categories/${cat.id}`}
                  onUpdated={refresh}
                />
                <Badge variant={cat.isVisible ? "success" : "secondary"}>
                  {cat.isVisible ? "Visible" : "Hidden"}
                </Badge>
                <RowActions
                  onEdit={() => openEdit(cat)}
                  onDelete={async () => {
                    await apiRequest(`/api/categories/${cat.id}`, { method: "DELETE" });
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
