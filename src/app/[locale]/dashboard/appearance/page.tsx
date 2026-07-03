import { getSession } from "@/lib/auth";
import { getRestaurantThemeState } from "@/features/themes/services/theme-service";
import { AppearanceManager } from "@/components/dashboard/appearance-manager";

export default async function AppearancePage() {
  const session = await getSession();
  if (!session) return null;

  const state = await getRestaurantThemeState(session.restaurantId);

  return (
    <AppearanceManager
      activeMenuTheme={state.activeMenuTheme}
      themes={state.themes}
    />
  );
}
