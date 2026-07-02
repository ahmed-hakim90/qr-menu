"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error?.message || data.error || "Request failed");
  }

  return res.json();
}

export function useDashboardRefresh() {
  const router = useRouter();
  return () => {
    router.refresh();
    toast.success("Saved");
  };
}
