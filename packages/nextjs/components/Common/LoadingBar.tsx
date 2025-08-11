import React from "react";

interface LoadingBarProps {
  progress: number; // 0-100
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ progress, className = "" }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const width = `${clampedProgress}%`;

  return (
    <div className={`flex flex-row gap-2 items-center justify-start p-0 relative w-full ${className}`}>
      <div className="basis-0 bg-[#292929] flex flex-row grow h-10 items-center justify-start min-h-px min-w-px overflow-clip p-[6px] relative rounded shrink-0">
        <div
          className="bg-gradient-to-l from-[#caffef] h-full relative rounded shrink-0 to-[#416af9] via-[#6fb2f1]"
          style={{ width }}
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
        <p className="block leading-[normal]">{Math.round(clampedProgress)}%</p>
      </div>
    </div>
  );
};
