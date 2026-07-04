"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  CreditCard,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Nfc,
  Paintbrush,
  Palette,
  Printer,
  QrCode,
  ScanLine,
  Settings,
  Shield,
  Sparkles,
  TableProperties,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/restaurants", icon: Building2, label: "Restaurants" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/theme-purchases", icon: Palette, label: "Theme Purchases" },
  { href: "/admin/menu-themes", icon: Paintbrush, label: "Menu Themes" },
  { href: "/admin/plans", icon: Layers, label: "Plans" },
] as const;

const qrNfcItems = [
  { href: "/admin/qr-nfc", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/qr-nfc/inventory", icon: QrCode, label: "QR Inventory" },
  { href: "/admin/qr-nfc/nfc", icon: Nfc, label: "NFC Cards" },
  { href: "/admin/qr-nfc/assignments", icon: TableProperties, label: "Assignments" },
  { href: "/admin/qr-nfc/print-queue", icon: Printer, label: "Print Queue" },
  { href: "/admin/qr-nfc/scan-logs", icon: ScanLine, label: "Scan Logs" },
  { href: "/admin/qr-nfc/bulk-generator", icon: Sparkles, label: "Bulk Generator" },
  { href: "/admin/qr-nfc/batches", icon: Layers, label: "Card Batches" },
  { href: "/admin/qr-nfc/settings", icon: Settings, label: "Settings" },
] as const;

interface AdminSidebarProps {
  adminName: string;
  pendingPayments?: number;
  pendingThemePurchases?: number;
}

export function AdminSidebar({
  adminName,
  pendingPayments = 0,
  pendingThemePurchases = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isQrNfcSection = pathname.startsWith("/admin/qr-nfc");
  const [qrNfcOpen, setQrNfcOpen] = useState(isQrNfcSection);

  const NavContent = (
    <>
      <div className="p-6 border-b border-border/50">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Super Admin
        </Link>
        <p className="text-sm text-muted-foreground mt-2">{adminName}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {href === "/admin/subscriptions" && pendingPayments > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {pendingPayments}
                </span>
              )}
              {href === "/admin/theme-purchases" && pendingThemePurchases > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {pendingThemePurchases}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setQrNfcOpen(!qrNfcOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
              isQrNfcSection
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <QrCode className="h-4 w-4" />
            <span className="flex-1 text-start">QR & NFC</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", qrNfcOpen && "rotate-180")} />
          </button>

          {qrNfcOpen && (
            <div className="mt-1 ms-3 space-y-0.5 border-s border-border/50 ps-3">
              {qrNfcItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={async () => {
            await fetch("/api/admin/auth/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 start-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 w-64 bg-card border-e border-border/50 flex flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full rtl:lg:translate-x-0"
        )}
      >
        {NavContent}
      </aside>
    </>
  );
}
