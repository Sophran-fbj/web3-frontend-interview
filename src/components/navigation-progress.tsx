"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const barRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    active: boolean;
    resetTimer?: ReturnType<typeof setTimeout>;
    failSafeTimer?: ReturnType<typeof setTimeout>;
  }>({ active: false });

  useEffect(() => {
    function clearTimers() {
      if (stateRef.current.resetTimer) {
        clearTimeout(stateRef.current.resetTimer);
        stateRef.current.resetTimer = undefined;
      }
      if (stateRef.current.failSafeTimer) {
        clearTimeout(stateRef.current.failSafeTimer);
        stateRef.current.failSafeTimer = undefined;
      }
    }

    function finish() {
      if (!stateRef.current.active) return;
      stateRef.current.active = false;
      clearTimers();
      const bar = barRef.current;
      if (!bar) return;
      bar.style.transition =
        "transform 160ms ease-out, opacity 220ms ease 100ms";
      bar.style.transform = "scaleX(1)";
      bar.style.opacity = "0";
      stateRef.current.resetTimer = setTimeout(() => {
        if (barRef.current && !stateRef.current.active) {
          barRef.current.style.transition = "none";
          barRef.current.style.transform = "scaleX(0)";
        }
      }, 340);
    }

    function start() {
      clearTimers();
      stateRef.current.active = true;
      const bar = barRef.current;
      if (!bar) return;
      bar.style.transition = "none";
      bar.style.opacity = "1";
      bar.style.transform = "scaleX(0.18)";
      requestAnimationFrame(() => {
        if (!barRef.current || !stateRef.current.active) return;
        barRef.current.style.transition =
          "transform 750ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease";
        barRef.current.style.transform = "scaleX(0.82)";
      });
      stateRef.current.failSafeTimer = setTimeout(finish, 8000);
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (nextUrl.origin !== window.location.origin) return;

      const currentFull = `${window.location.pathname}${window.location.search}`;
      const nextFull = `${nextUrl.pathname}${nextUrl.search}`;
      if (currentFull === nextFull) return;

      start();
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!stateRef.current.active) return;
    stateRef.current.active = false;
    if (stateRef.current.failSafeTimer) {
      clearTimeout(stateRef.current.failSafeTimer);
      stateRef.current.failSafeTimer = undefined;
    }
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "transform 160ms ease-out, opacity 220ms ease 100ms";
    bar.style.transform = "scaleX(1)";
    bar.style.opacity = "0";
    stateRef.current.resetTimer = setTimeout(() => {
      if (barRef.current && !stateRef.current.active) {
        barRef.current.style.transition = "none";
        barRef.current.style.transform = "scaleX(0)";
      }
    }, 340);
  }, [routeKey]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[var(--accent)] via-[var(--accent-bright)] to-[var(--info)] opacity-0 motion-reduce:transition-none"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
