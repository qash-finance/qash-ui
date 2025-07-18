"use client";

import React from "react";

interface ProgressIndicatorProps {
  percentage: number;
  totalBars?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ percentage, totalBars = 30 }) => {
  const filledBars = Math.round((percentage / 100) * totalBars);

  return (
    <div className="flex flex-1 h-full min-w-60 gap-1">
      <div className="my-auto text-lg leading-none text-center text-sky-400 w-[50px]">{percentage}%</div>
      <div className="flex gap-1 py-2 h-full">
        {Array.from({ length: totalBars }, (_, index) => (
          <div
            key={index}
            className={`flex shrink-0 h-9 rounded w-[5px] ${index < filledBars ? "bg-sky-400" : "bg-zinc-700"}`}
          />
        ))}
      </div>
    </div>
  );
};
