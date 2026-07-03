"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 end-4 flex gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const cardHeader = (
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
      </div>
      <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
    </CardHeader>
  );

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        {cardHeader}
        <CardContent>
          <p className="text-center text-sm text-destructive">{t("invalidResetToken")}</p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
              {t("forgotPasswordLink")}
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-primary transition-colors">
              {t("backToLogin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        {cardHeader}
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">{t("resetSuccess")}</p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              {tCommon("login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      const apiError = typeof data.error === "string" ? data.error : t("resetFailed");
      setError(apiError === "Invalid or expired reset token" ? t("invalidResetToken") : apiError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/auth/login");
      router.refresh();
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md">
      {cardHeader}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("resetPasswordButton")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="hover:text-primary transition-colors">
            {t("backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <AuthShell>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t("resetPasswordLoading")}</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
