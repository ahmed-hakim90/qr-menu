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
import { ImageUpload } from "./image-upload";
import { RowActions, ToggleField } from "./entity-actions";
import { apiRequest } from "@/lib/dashboard-api";
import { formatPrice } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { Branch, Category, Product, ProductBranch } from "@/generated/prisma";

type ProductWithRelations = Product & {
  category: Category;
  productBranches?: (ProductBranch & { branch: Branch })[];
};

interface ProductsManagerProps {
  products: ProductWithRelations[];
  categories: Category[];
  branches: Branch[];
  currencySymbol?: string;
  productLimit: number;
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
  spiceLevel: "",
};

export function ProductsManager({
  products,
  categories,
  branches,
  currencySymbol = CURRENCY_SYMBOL,
  productLimit,
}: ProductsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithRelations | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const atLimit = products.length >= productLimit;

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
    setBranchIds(branches.map((branch) => branch.id));
    setOpen(true);
  };

  const openEdit = (product: ProductWithRelations) => {
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
      spiceLevel: product.spiceLevel ? String(product.spiceLevel) : "",
    });
    setBranchIds(product.productBranches?.map((item) => item.branchId) || branches.map((branch) => branch.id));
    setOpen(true);
  };

  const toggleBranch = (branchId: string) => {
    setBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    );
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
        spiceLevel: form.spiceLevel ? Number(form.spiceLevel) : null,
        branchIds,
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
          <p className="text-sm text-muted-foreground">
            {products.length} / {productLimit} products used
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} disabled={atLimit}>
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
              <ImageUpload
                label="Product Image"
                aspect="square"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />

              <div className="space-y-2">
                <Label>Available in Branches</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {branches.map((branch) => (
                    <label
                      key={branch.id}
                      className="flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm"
                    >
                      <Switch
                        checked={branchIds.includes(branch.id)}
                        onCheckedChange={() => toggleBranch(branch.id)}
                      />
                      <span>{branch.nameEn}</span>
                    </label>
                  ))}
                </div>
                {branchIds.length === 0 && (
                  <p className="text-xs text-destructive">Select at least one branch</p>
                )}
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

              {form.isSpicy && (
                <div className="space-y-2">
                  <Label>Spice Level</Label>
                  <Select
                    value={form.spiceLevel}
                    onChange={(e) => setForm({ ...form, spiceLevel: e.target.value })}
                  >
                    <option value="">Select level</option>
                    <option value="1">🌶️ Mild</option>
                    <option value="2">🌶️🌶️ Medium</option>
                    <option value="3">🌶️🌶️🌶️ Hot</option>
                    <option value="4">🌶️🌶️🌶️🌶️ Very Hot</option>
                    <option value="5">🌶️🌶️🌶️🌶️🌶️ Extreme</option>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time</Label>
                  <Select
                    value={form.prepTime}
                    onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                  >
                    <option value="">Not specified</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[150, 250, 350, 500, 750].map((cal) => (
                      <Button
                        key={cal}
                        type="button"
                        size="sm"
                        variant={form.calories === String(cal) ? "default" : "outline"}
                        onClick={() => setForm({ ...form, calories: String(cal) })}
                      >
                        {cal}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Custom calories"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving || branchIds.length === 0}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {atLimit && (
        <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-300">
            You reached your product limit. Upgrade your plan from Billing to add more products.
          </CardContent>
        </Card>
      )}

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
                <p className="text-sm text-muted-foreground truncate">
                  {product.nameAr} · {product.category.nameEn}
                  {product.productBranches && product.productBranches.length > 0 && (
                    <> · {product.productBranches.length} branch(es)</>
                  )}
                </p>
                <p className="font-semibold text-primary mt-1">{formatPrice(product.price, currencySymbol)}</p>
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
