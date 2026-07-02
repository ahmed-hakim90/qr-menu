import { useEffect } from "react";

/** Defers effect work to the next microtask to avoid synchronous setState in effects. */
export function useDeferredEffect(
  effect: () => void | (() => void),
  deps: readonly unknown[]
) {
  useEffect(() => {
    let cleanup: void | (() => void);

    queueMicrotask(() => {
      cleanup = effect();
    });

    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
