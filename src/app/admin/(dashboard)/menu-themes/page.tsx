import { MenuThemesManager } from "@/components/admin/menu-themes-manager";
import { getAdminMenuThemes } from "@/features/themes/services/theme-service";

export default async function AdminMenuThemesPage() {
  const themes = await getAdminMenuThemes();

  return <MenuThemesManager themes={themes} />;
}
