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
      <div className="basis-0 bg-[#292929] flex flex-row grow h-10 items-center justify-start min-h-px min-w-px overflow-clip p-[6px] relative rounded shrink-0">
        <div
          className="bg-gradient-to-l from-[#caffef] h-full relative rounded shrink-0 to-[#416af9] via-[#6fb2f1] will-change-[width]"
          style={{ width }}
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
      <div className="font-['Barlow:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#fbfeff] text-[24px] text-right w-14">
        <p className="block leading-[normal]">{Math.round(animatedProgress)}%</p>
      </div>
    </div>
  );
};
