"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./image-upload";
import { RowActions, ToggleField } from "./entity-actions";
import { WorkingHoursEditor } from "./working-hours-editor";
import { LocationPicker, googleMapsUrl } from "./location-picker";
import { SocialInput, fromSocialUrl, toSocialUrl } from "./social-input";
import { apiRequest } from "@/lib/dashboard-api";
import {
  defaultWorkingHours,
  normalizeWorkingHours,
  parseWorkingHours,
  type WorkingHours,
} from "@/lib/working-hours";
import type { Branch } from "@/generated/prisma";

interface BranchesManagerProps {
  branches: Branch[];
  branchLimit: number;
}

const COLOR_PRESETS = [
  { primary: "#1a1a2e", secondary: "#e94560", label: "Classic" },
  { primary: "#0f172a", secondary: "#f59e0b", label: "Midnight" },
  { primary: "#14532d", secondary: "#84cc16", label: "Fresh" },
  { primary: "#1e3a5f", secondary: "#38bdf8", label: "Ocean" },
  { primary: "#3f1d1d", secondary: "#f97316", label: "Warm" },
];

const emptyForm = {
  nameAr: "",
  nameEn: "",
  addressAr: "",
  addressEn: "",
  phone: "",
  whatsapp: "",
  reservationPhone: "",
  googleReviewUrl: "",
  instagram: "",
  facebook: "",
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
  const [form, setForm] = useState(emptyForm);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(defaultWorkingHours());
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const atLimit = branches.length >= branchLimit;

  const refresh = () => {
    router.refresh();
    toast.success("Saved");
  };

  const set = (key: keyof typeof emptyForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setWorkingHours(defaultWorkingHours());
    setLatitude(null);
    setLongitude(null);
    setOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      nameAr: branch.nameAr,
      nameEn: branch.nameEn,
      addressAr: branch.addressAr || "",
      addressEn: branch.addressEn || "",
      phone: fromSocialUrl("phone", branch.phone),
      whatsapp: fromSocialUrl("whatsapp", branch.whatsapp),
      reservationPhone: fromSocialUrl("phone", branch.reservationPhone),
      googleReviewUrl: branch.googleReviewUrl || "",
      instagram: fromSocialUrl("instagram", branch.instagram),
      facebook: fromSocialUrl("facebook", branch.facebook),
      logo: branch.logo || "",
      coverImage: branch.coverImage || "",
      primaryColor: branch.primaryColor,
      secondaryColor: branch.secondaryColor,
      isActive: branch.isActive,
    });
    setWorkingHours(parseWorkingHours(branch.workingHours) || defaultWorkingHours());
    setLatitude(branch.latitude);
    setLongitude(branch.longitude);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: toSocialUrl("phone", form.phone),
        whatsapp: toSocialUrl("whatsapp", form.whatsapp),
        reservationPhone: toSocialUrl("phone", form.reservationPhone),
        googleReviewUrl: form.googleReviewUrl.trim() || undefined,
        instagram: toSocialUrl("instagram", form.instagram),
        facebook: toSocialUrl("facebook", form.facebook),
        workingHours: normalizeWorkingHours(workingHours),
        latitude,
        longitude,
        googleMaps:
          latitude !== null && longitude !== null
            ? googleMapsUrl(latitude, longitude)
            : undefined,
      };

      if (editing) {
        await apiRequest(`/api/branches/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/branches", {
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
                value={form.coverImage}
                onChange={(url) => set("coverImage", url)}
              />
              <ImageUpload
                label="Logo"
                aspect="square"
                value={form.logo}
                onChange={(url) => set("logo", url)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required />
                </div>
              </div>

              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={({ latitude: lat, longitude: lng }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                onAddressResolved={({ addressAr, addressEn }) => {
                  setForm((prev) => ({ ...prev, addressAr, addressEn }));
                }}
              />

              <WorkingHoursEditor value={workingHours} onChange={setWorkingHours} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SocialInput
                  platform="phone"
                  value={form.phone}
                  onChange={(value) => set("phone", value)}
                />
                <SocialInput
                  platform="whatsapp"
                  value={form.whatsapp}
                  onChange={(value) => set("whatsapp", value)}
                />
                <SocialInput
                  platform="phone"
                  label="Reservation Phone"
                  value={form.reservationPhone}
                  onChange={(value) => set("reservationPhone", value)}
                />
                <div className="space-y-2 sm:col-span-2">
                  <Label>Google Maps Review Link</Label>
                  <Input
                    type="url"
                    value={form.googleReviewUrl}
                    onChange={(e) => set("googleReviewUrl", e.target.value)}
                    placeholder="https://g.page/r/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste your Google review link so customers can leave a rating from the public menu.
                  </p>
                </div>
                <SocialInput
                  platform="instagram"
                  value={form.instagram}
                  onChange={(value) => set("instagram", value)}
                />
                <SocialInput
                  platform="facebook"
                  value={form.facebook}
                  onChange={(value) => set("facebook", value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        set("primaryColor", preset.primary);
                        set("secondaryColor", preset.secondary);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ background: preset.primary }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ background: preset.secondary }}
                      />
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={form.primaryColor}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className="w-14 h-11 p-1"
                      />
                      <Input
                        value={form.primaryColor}
                        onChange={(e) => set("primaryColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={form.secondaryColor}
                        onChange={(e) => set("secondaryColor", e.target.value)}
                        className="w-14 h-11 p-1"
                      />
                      <Input
                        value={form.secondaryColor}
                        onChange={(e) => set("secondaryColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                Branch active (visible to customers)
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
                  {branch.latitude && branch.longitude && (
                    <Badge variant="secondary">Location set</Badge>
                  )}
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
