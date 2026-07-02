"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

function formatApiError(error: unknown, status: number): string {
  if (!error) return statusText(status);

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null) {
    const record = error as {
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };

    if (record.message) return record.message;

    const fieldMessages = record.fieldErrors
      ? Object.entries(record.fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => `${field}: ${message}`)
        )
      : [];

    if (fieldMessages.length > 0) return fieldMessages.join(". ");

    if (record.formErrors?.length) return record.formErrors.join(". ");

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      // ignore circular structures
    }
  }

  return statusText(status);
}

function statusText(status: number) {
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";
  if (status >= 500) return "Server error";
  return "Request failed";
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: unknown };
    throw new Error(formatApiError(data.error, res.status));
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
