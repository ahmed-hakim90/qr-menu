import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MenuView } from "@/components/menu/menu-view";
import {
  getMenuPreviewData,
  resolvePreviewTheme,
} from "@/features/themes/services/menu-preview-service";

interface MenuPreviewPageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function MenuPreviewPage({ searchParams }: MenuPreviewPageProps) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const query = await searchParams;
  const menuTheme = resolvePreviewTheme(query.theme);
  const previewData = await getMenuPreviewData(session.restaurantId);

  if (!previewData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-muted-foreground">
        Add a branch and products to preview menu themes.
      </div>
    );
  }

  const { branch, categories, allProducts, currencySymbol } = previewData;

  return (
    <div className="h-screen overflow-y-auto overscroll-contain bg-background">
      <div className="pointer-events-none select-none">
        <MenuView
          branch={branch}
          categories={categories}
          allProducts={allProducts}
          currencySymbol={currencySymbol}
          menuTheme={menuTheme}
        />
      </div>
    </div>
  );
}
