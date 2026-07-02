"use client";

import { useEffect } from "react";

export function useRestaurantRealtime(onEvent: (payload: unknown) => void) {
  useEffect(() => {
    const source = new EventSource("/api/notifications/stream");

    source.addEventListener("update", (event) => {
      try {
        onEvent(JSON.parse(event.data));
      } catch {
        // Ignore malformed payloads.
      }
    });

    return () => source.close();
  }, [onEvent]);
}
