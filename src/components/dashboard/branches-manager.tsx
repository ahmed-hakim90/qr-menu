"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Branch } from "@/generated/prisma";

interface BranchesManagerProps {
  branches: Branch[];
  branchLimit: number;
}

const emptyForm = {
  nameAr: "",
  nameEn: "",
  addressAr: "",
  addressEn: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  googleMaps: "",
  hoursAr: "",
  hoursEn: "",
  logo: "",
  coverImage: "",
  primaryColor: "#1a1a2e",
  secondaryColor: "#e94560",
  isActive: true,
};

export function BranchesManager({ branches, branchLimit }: BranchesManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>(emptyForm);
  const atLimit = branches.length >= branchLimit;

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      nameAr: branch.nameAr,
      nameEn: branch.nameEn,
      addressAr: branch.addressAr || "",
      addressEn: branch.addressEn || "",
      phone: branch.phone || "",
      whatsapp: branch.whatsapp || "",
      instagram: branch.instagram || "",
      facebook: branch.facebook || "",
      googleMaps: branch.googleMaps || "",
      hoursAr: branch.hoursAr || "",
      hoursEn: branch.hoursEn || "",
      logo: branch.logo || "",
      coverImage: branch.coverImage || "",
      primaryColor: branch.primaryColor,
      secondaryColor: branch.secondaryColor,
      isActive: branch.isActive,
    });
    setOpen(true);
  };

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/branches/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest("/api/branches", {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-sm text-muted-foreground">
            {branches.length} / {branchLimit} branches used
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} disabled={atLimit}>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Branch" : "Add Branch"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <ImageUpload
                label="Cover Image (Header)"
                aspect="wide"
                value={(form.coverImage as string) || ""}
                onChange={(url) => set("coverImage", url)}
              />
              <ImageUpload
                label="Logo"
                aspect="square"
                value={(form.logo as string) || ""}
                onChange={(url) => set("logo", url)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input value={form.nameAr as string} onChange={(e) => set("nameAr", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input value={form.nameEn as string} onChange={(e) => set("nameEn", e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address (Arabic)</Label>
                  <Input value={form.addressAr as string} onChange={(e) => set("addressAr", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Address (English)</Label>
                  <Input value={form.addressEn as string} onChange={(e) => set("addressEn", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours (Arabic)</Label>
                  <Textarea value={form.hoursAr as string} onChange={(e) => set("hoursAr", e.target.value)} className="min-h-[70px]" />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours (English)</Label>
                  <Textarea value={form.hoursEn as string} onChange={(e) => set("hoursEn", e.target.value)} className="min-h-[70px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone as string} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp as string} onChange={(e) => set("whatsapp", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input value={form.instagram as string} onChange={(e) => set("instagram", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input value={form.facebook as string} onChange={(e) => set("facebook", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Google Maps URL</Label>
                  <Input value={form.googleMaps as string} onChange={(e) => set("googleMaps", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={form.primaryColor as string} onChange={(e) => set("primaryColor", e.target.value)} className="w-14 h-11 p-1" />
                    <Input value={form.primaryColor as string} onChange={(e) => set("primaryColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={form.secondaryColor as string} onChange={(e) => set("secondaryColor", e.target.value)} className="w-14 h-11 p-1" />
                    <Input value={form.secondaryColor as string} onChange={(e) => set("secondaryColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.isActive as boolean} onCheckedChange={(v) => set("isActive", v)} />
                Branch active (visible to customers)
              </label>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {atLimit && (
        <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-300">
            You reached your branch limit. Upgrade your plan from Billing to add more branches.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold text-lg">{branch.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{branch.nameAr}</p>
                <p className="text-sm text-muted-foreground mt-1">{branch.addressEn}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={branch.isActive ? "success" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <ToggleField
                  id={branch.id}
                  label={branch.isActive ? "Active" : "Hidden"}
                  checked={branch.isActive}
                  field="isActive"
                  endpoint={`/api/branches/${branch.id}`}
                  onUpdated={refresh}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/menu/${branch.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <RowActions
                    onEdit={() => openEdit(branch)}
                    onDelete={async () => {
                      await apiRequest(`/api/branches/${branch.id}`, { method: "DELETE" });
                      refresh();
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
