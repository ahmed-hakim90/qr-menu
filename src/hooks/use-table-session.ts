"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";

const STORAGE_KEY = "restaurantos_session_id";

export function useTableSession(branchSlug: string, tableNumber?: number) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async (id: string) => {
    const response = await fetch(`/api/public/sessions?sessionId=${id}`);
    if (!response.ok) {
      localStorage.removeItem(STORAGE_KEY);
      setSessionId(null);
      return null;
    }
    const data = await response.json();
    setSessionId(data.id);
    return data;
  }, []);

  const openSession = useCallback(async () => {
    if (!tableNumber) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/public/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchSlug, tableNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to open session");
      }

      localStorage.setItem(STORAGE_KEY, data.id);
      setSessionId(data.id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open session");
      return null;
    } finally {
      setLoading(false);
    }
  }, [branchSlug, tableNumber]);

  useDeferredEffect(() => {
    if (!tableNumber) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      refreshSession(stored).then((session) => {
        if (!session) openSession();
      });
      return;
    }

    openSession();
  }, [tableNumber, openSession, refreshSession]);

  const requestBill = async () => {
    if (!sessionId) return;
    const response = await fetch("/api/public/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request_bill", sessionId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to request bill");
    }
    return response.json();
  };

  const callWaiter = async () => {
    if (!sessionId) return;
    const response = await fetch("/api/public/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "call_waiter", sessionId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to call waiter");
    }
    return response.json();
  };

  return {
    sessionId,
    loading,
    error,
    openSession,
    requestBill,
    callWaiter,
  };
}
