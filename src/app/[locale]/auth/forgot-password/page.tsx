"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSent(false);
    setResetUrl(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setResetUrl(data.resetUrl ?? null);
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 end-4 flex gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("forgotPasswordTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t("forgotPasswordSubtitle")}</p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-center text-sm text-muted-foreground">{t("forgotPasswordSent")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@basata.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : t("forgotPasswordButton")}
              </Button>
            </form>
          )}
          {resetUrl && (
            <p className="mt-4 text-sm break-all">
              Dev reset link:{" "}
              <Link href={resetUrl.replace(/^https?:\/\/[^/]+/, "")} className="text-primary hover:underline">
                {resetUrl}
              </Link>
            </p>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-primary transition-colors">
              {t("backToLogin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
