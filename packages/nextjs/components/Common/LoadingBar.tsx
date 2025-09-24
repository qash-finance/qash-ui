import React, { useEffect, useRef, useState } from "react";

interface LoadingBarProps {
  progress: number; // 0-100
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ progress, className = "" }) => {
  const targetProgress = Math.min(Math.max(progress, 0), 100);

  const [animatedProgress, setAnimatedProgress] = useState<number>(targetProgress);
  const rafIdRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const fromRef = useRef<number>(targetProgress);

  useEffect(() => {
    // Cancel any in-flight animation
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const from = animatedProgress;
    const to = targetProgress;
    if (from === to) return;

    fromRef.current = from;
    startTsRef.current = null;

    // Duration scales with distance; clamped for UX consistency
    const durationMs = Math.min(800, Math.max(200, Math.abs(to - from) * 12));

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (timestamp: number) => {
      if (startTsRef.current === null) startTsRef.current = timestamp;
      const elapsed = timestamp - (startTsRef.current ?? timestamp);
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      const value = from + (to - from) * eased;
      setAnimatedProgress(value);
      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
    // Only re-run when the target changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProgress]);

  const width = `${animatedProgress}%`;

  return (
    <div className={`flex flex-row gap-2 items-center justify-start p-0 relative w-full ${className}`}>
      <div
        className="basis-0 flex flex-row grow h-10 items-center justify-start min-h-px min-w-px overflow-clip p-[6px] relative rounded-[4px] shrink-0"
        style={{
          backgroundColor: "var(--color-loading-bar-background)",
          border: "1px solid var(--color-loading-bar-border)",
        }}
      >
        <div
          className="h-full relative rounded-[4px] shrink-0 will-change-[width]"
          style={{
            width,
            background: "var(--color-loading-bar-gradient)",
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(animatedProgress)}
        >
          <div
            className="absolute bg-[#b5e0ff] blur-[6px] filter h-10 rounded-[32px] top-[-4px] w-[7.373px]"
            style={{ right: "-3.686px" }}
          />
          <div
            className="absolute bg-[#cefffb] h-10 rounded-[32px] top-1/2 translate-y-[-50%] w-[3px]"
            style={{ right: "-1.5px" }}
          />
        </div>
      </div>
      <span className="text-text-primary font-bold text-2xl">{Math.round(animatedProgress)}%</span>
    </div>
  );
};
