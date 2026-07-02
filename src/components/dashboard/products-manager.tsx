"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { RowActions, ToggleField } from "./entity-actions";
import { apiRequest } from "@/lib/dashboard-api";
import { formatPrice } from "@/lib/utils";
import type { Category, Product } from "@/generated/prisma";

type ProductWithCategory = Product & { category: Category };

interface ProductsManagerProps {
  products: ProductWithCategory[];
  categories: Category[];
}

const emptyForm = {
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  image: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  isAvailable: true,
  isBestSeller: false,
  isNew: false,
  isOffer: false,
  isSpicy: false,
  isVegetarian: false,
  isVegan: false,
  isHot: false,
  isCold: false,
  calories: "",
  prepTime: "",
};

export function ProductsManager({ products, categories }: ProductsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nameEn.toLowerCase().includes(q) ||
      p.nameAr.includes(q) ||
      p.category.nameEn.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
    setOpen(true);
  };

  const openEdit = (product: ProductWithCategory) => {
    setEditing(product);
    setForm({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      descriptionAr: product.descriptionAr || "",
      descriptionEn: product.descriptionEn || "",
      image: product.image || "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      isBestSeller: product.isBestSeller,
      isNew: product.isNew,
      isOffer: product.isOffer,
      isSpicy: product.isSpicy,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      isHot: product.isHot,
      isCold: product.isCold,
      calories: product.calories ? String(product.calories) : "",
      prepTime: product.prepTime ? String(product.prepTime) : "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        calories: form.calories ? Number(form.calories) : null,
        prepTime: form.prepTime ? Number(form.prepTime) : null,
      };

      if (editing) {
        await apiRequest(`/api/products/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/products", {
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

  const setFlag = (key: keyof typeof form, value: boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} total products</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (Arabic)</Label>
                  <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Old Price</Label>
                  <Input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["isAvailable", "Available"],
                  ["isBestSeller", "Best Seller"],
                  ["isNew", "New"],
                  ["isOffer", "Offer"],
                  ["isSpicy", "Spicy"],
                  ["isVegetarian", "Vegetarian"],
                  ["isVegan", "Vegan"],
                  ["isHot", "Hot"],
                  ["isCold", "Cold"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={(v) => setFlag(key as keyof typeof form, v)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="ps-11"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.image ? (
                  <Image src={product.image} alt={product.nameEn} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.nameEn}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.nameAr} · {product.category.nameEn}</p>
                <p className="font-semibold text-primary mt-1">{formatPrice(product.price)}</p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <ToggleField
                  id={product.id}
                  label={product.isAvailable ? "Visible" : "Hidden"}
                  checked={product.isAvailable}
                  field="isAvailable"
                  endpoint={`/api/products/${product.id}`}
                  onUpdated={refresh}
                />
                <div className="flex gap-1 flex-wrap justify-end">
                  {product.isBestSeller && <Badge variant="warning">Best</Badge>}
                  {product.isNew && <Badge variant="success">New</Badge>}
                  {!product.isAvailable && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <RowActions
                  onEdit={() => openEdit(product)}
                  onDelete={async () => {
                    await apiRequest(`/api/products/${product.id}`, { method: "DELETE" });
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
