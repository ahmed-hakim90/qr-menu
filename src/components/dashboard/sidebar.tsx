"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Globe,
  LayoutDashboard,
  Building2,
  FolderOpen,
  Package,
  Tag,
  Plus,
  Ruler,
  UtensilsCrossed,
  Image,
  Film,
  QrCode,
  Palette,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Compass,
  Wallet,
  BarChart3,
  CalendarDays,
  Grid3x3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma";

type NavFeature = "tables" | "ordering";

type NavItem = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  key: string;
  minRole: UserRole;
  feature?: NavFeature;
  hidden?: boolean;
};

const navItems: NavItem[] = [
  // Overview & insights
  { href: "/dashboard", icon: LayoutDashboard, key: "overview", minRole: "VIEWER" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics", minRole: "MANAGER" },
  // Daily operations
  { href: "/dashboard/orders", icon: ClipboardList, key: "orders", minRole: "CAPTAIN", feature: "ordering" },
  { href: "/dashboard/captain", icon: Compass, key: "captain", minRole: "CAPTAIN", feature: "ordering" },
  { href: "/dashboard/cashier", icon: Wallet, key: "cashier", minRole: "CASHIER", feature: "ordering" },
  // Tables & reservations
  { href: "/dashboard/tables", icon: UtensilsCrossed, key: "tables", minRole: "MANAGER", feature: "tables" },
  { href: "/dashboard/floor", icon: Grid3x3, key: "floor", minRole: "MANAGER", feature: "tables" },
  { href: "/dashboard/reservations", icon: CalendarDays, key: "reservations", minRole: "MANAGER", feature: "tables" },
  // Menu content
  { href: "/dashboard/categories", icon: FolderOpen, key: "categories", minRole: "VIEWER" },
  { href: "/dashboard/products", icon: Package, key: "products", minRole: "VIEWER" },
  { href: "/dashboard/offers", icon: Tag, key: "offers", minRole: "VIEWER", hidden: true },
  { href: "/dashboard/addons", icon: Plus, key: "addons", minRole: "VIEWER" },
  { href: "/dashboard/sizes", icon: Ruler, key: "sizes", minRole: "VIEWER" },
  // Media
  { href: "/dashboard/gallery", icon: Image, key: "gallery", minRole: "VIEWER", hidden: true },
  { href: "/dashboard/media", icon: Film, key: "media", minRole: "VIEWER", hidden: true },
  // Customer-facing
  { href: "/dashboard/qr-codes", icon: QrCode, key: "qrCodes", minRole: "VIEWER" },
  { href: "/dashboard/appearance", icon: Palette, key: "appearance", minRole: "MANAGER" },
  { href: "/dashboard/domain", icon: Globe, key: "domain", minRole: "MANAGER" },
  // Administration
  { href: "/dashboard/branches", icon: Building2, key: "branches", minRole: "VIEWER" },
  { href: "/dashboard/users", icon: Users, key: "users", minRole: "MANAGER" },
  { href: "/dashboard/billing", icon: CreditCard, key: "billing", minRole: "MANAGER" },
  { href: "/dashboard/settings", icon: Settings, key: "settings", minRole: "MANAGER" },
];

interface DashboardSidebarProps {
  userName: string;
  userRole: UserRole;
  features?: {
    hasTables: boolean;
    hasOrdering: boolean;
  };
}

function isNavFeatureEnabled(
  feature: NavFeature | undefined,
  features: DashboardSidebarProps["features"]
) {
  if (!feature) return true;
  if (feature === "tables") return features?.hasTables ?? false;
  if (feature === "ordering") return features?.hasOrdering ?? false;
  return true;
}

export function DashboardSidebar({ userName, userRole, features }: DashboardSidebarProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalizedPath = pathname.replace(/^\/(ar|en)/, "") || "/dashboard";

  const NavContent = (
    <>
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <QrCode className="h-5 w-5 text-primary" />
          {tCommon("appName")}
        </Link>
        <p className="text-sm text-muted-foreground mt-2">{userName}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, key, feature, minRole, hidden }) => {
          if (hidden) return null;
          if (!hasPermission(userRole, [minRole])) return null;
          if (!isNavFeatureEnabled(feature, features)) return null;
          const isActive = normalizedPath === href || (href !== "/dashboard" && normalizedPath.startsWith(href));
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
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" type="submit">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
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
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
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
