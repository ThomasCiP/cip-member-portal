import { useEffect, useRef, useState } from "react";

/**
 * Mobile pull-to-refresh for a scrollable element.
 *
 * Deliberately hand-rolled rather than pulled from a library: the app already
 * owns its scroll container, and this needs to cooperate with the WebView's own
 * overscroll rather than fight it.
 *
 * Behaviour:
 *  - only arms when the container is scrolled to the very top, so it never
 *    hijacks a normal upward scroll
 *  - the indicator follows the finger with damping, up to MAX_PULL
 *  - releasing past THRESHOLD runs `onRefresh`; anything less snaps back
 *  - `distance`/`refreshing` drive a visible loading state
 *
 * Touch-only by design — desktop has no pull gesture and keeps normal scrolling.
 */
const THRESHOLD = 64;   // px of pull needed to trigger
const MAX_PULL = 96;    // px the indicator can travel
const DAMPING = 0.5;    // finger travel -> indicator travel

export function usePullToRefresh(
  // Structural type rather than React.RefObject: this project has no
  // @types/react installed, so the React namespace isn't available here.
  scrollRef: { current: HTMLElement | null },
  onRefresh: () => void | Promise<void>,
  enabled = true,
) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // Refs so the listeners (attached once) always see current values.
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  // Mirrors `distance` so touchend can read the latest value without the effect
  // having to re-subscribe on every pixel of movement.
  const distanceRef = useRef(0);

  distanceRef.current = distance;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || e.touches.length !== 1) return;
      // Only arm at the top; otherwise this is an ordinary scroll.
      if (el.scrollTop > 0) { startY.current = null; return; }
      startY.current = e.touches[0].clientY;
      active.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null || refreshingRef.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        // Pulling up — hand back to normal scrolling.
        if (active.current) { active.current = false; setDistance(0); }
        return;
      }
      if (el.scrollTop > 0) { startY.current = null; setDistance(0); return; }
      active.current = true;
      setDistance(Math.min(delta * DAMPING, MAX_PULL));
    };

    const onTouchEnd = async () => {
      if (startY.current === null) return;
      const pulled = active.current;
      const reached = pulled && distanceRef.current >= THRESHOLD;
      startY.current = null;
      active.current = false;

      if (!reached) { setDistance(0); return; }

      refreshingRef.current = true;
      setRefreshing(true);
      setDistance(THRESHOLD); // hold the spinner in place while loading
      try {
        await onRefreshRef.current();
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
        setDistance(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [scrollRef, enabled]);

  return { distance, refreshing, threshold: THRESHOLD };
}
