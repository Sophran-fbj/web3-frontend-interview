"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      frame = 0;
      const bar = barRef.current;
      if (!bar) return;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollHeight > 0
          ? Math.min(Math.max(window.scrollY / scrollHeight, 0), 1)
          : 0;
      bar.style.transform = `scaleX(${ratio})`;
    }

    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-0.5 bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
