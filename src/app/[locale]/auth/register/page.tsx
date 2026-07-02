"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

const initialForm = {
  restaurantNameAr: "",
  restaurantNameEn: "",
  branchNameAr: "",
  branchNameEn: "",
  ownerName: "",
  email: "",
  password: "",
  phone: "",
  whatsapp: "",
  currency: "SAR",
  currencySymbol: "ر.س",
  language: "ar",
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create account");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <div className="absolute top-4 end-4 flex gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <QrCode className="h-6 w-6 text-primary" />
            QR Menu
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t("registerTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restaurant Name (Arabic)</Label>
                  <Input
                    value={form.restaurantNameAr}
                    onChange={(e) => set("restaurantNameAr", e.target.value)}
                    required
                    placeholder="مطعم بساطة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Restaurant Name (English)</Label>
                  <Input
                    value={form.restaurantNameEn}
                    onChange={(e) => set("restaurantNameEn", e.target.value)}
                    required
                    placeholder="Basata Cafe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Branch Name (Arabic)</Label>
                  <Input
                    value={form.branchNameAr}
                    onChange={(e) => set("branchNameAr", e.target.value)}
                    required
                    placeholder="الفرع الرئيسي"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Branch Name (English)</Label>
                  <Input
                    value={form.branchNameEn}
                    onChange={(e) => set("branchNameEn", e.target.value)}
                    required
                    placeholder="Main Branch"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input
                    value={form.ownerName}
                    onChange={(e) => set("ownerName", e.target.value)}
                    required
                    placeholder="Hakimo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    placeholder="owner@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+9665..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="9665..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={form.language} onChange={(e) => set("language", e.target.value)}>
                    <option value="ar">Arabic</option>
                    <option value="en">English</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency Code</Label>
                  <Input
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value.toUpperCase())}
                    required
                    placeholder="SAR"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency Symbol</Label>
                  <Input
                    value={form.currencySymbol}
                    onChange={(e) => set("currencySymbol", e.target.value)}
                    required
                    placeholder="ر.س"
                  />
                </div>
              </div>

              {error && <p className="text-center text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : t("registerButton")}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                {tCommon("login")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
