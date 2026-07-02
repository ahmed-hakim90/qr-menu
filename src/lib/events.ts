export type RestaurantEvent = {
  type: string;
  restaurantId: string;
  branchId?: string;
  payload?: Record<string, unknown>;
  at: string;
};

type EventListener = (event: RestaurantEvent) => void;

declare global {
  var __restaurantOsEvents: Map<string, Set<EventListener>> | undefined;
}

function getEventMap() {
  if (!globalThis.__restaurantOsEvents) {
    globalThis.__restaurantOsEvents = new Map();
  }
  return globalThis.__restaurantOsEvents;
}

export function subscribeRestaurantEvents(
  restaurantId: string,
  listener: EventListener
) {
  const map = getEventMap();
  if (!map.has(restaurantId)) {
    map.set(restaurantId, new Set());
  }
  map.get(restaurantId)!.add(listener);
  return () => {
    map.get(restaurantId)?.delete(listener);
  };
}

export function publishRestaurantEvent(event: RestaurantEvent) {
  const listeners = getEventMap().get(event.restaurantId);
  listeners?.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // Ignore listener failures so one bad client cannot break publishers.
    }
  });
}
