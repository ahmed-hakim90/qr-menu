"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const FAVORITES_KEY = "qr-menu-favorites";

function getSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(FAVORITES_KEY) ?? "[]";
}

function parseFavorites(snapshot: string): string[] {
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const favorites = useMemo(() => parseFavorites(snapshot), [snapshot]);

  const toggleFavorite = useCallback((id: string) => {
    const current = parseFavorites(getSnapshot());
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
