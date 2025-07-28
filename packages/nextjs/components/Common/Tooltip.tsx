"use client";
import React from "react";
import { ActionButton } from "./ActionButton";

interface TooltipProps {
  icon?: string;
  text: string;
  onSkip?: () => void;
  onNext?: () => void;
  className?: string;
}

const imgFrame2147227025 = "http://localhost:3845/assets/831c7b5c7f538cb2c9b809868b4634808197d2d9.svg";

export const Tooltip: React.FC<TooltipProps> = ({ text, onSkip, onNext, className = "" }) => {
  return (
    <div
      className={`bg-[#d6edff] box-border content-stretch flex flex-col gap-4 items-end justify-end px-4 py-3 relative rounded-2xl size-full ${className}`}
    >
      <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
          <div
            className="bg-center bg-cover bg-no-repeat shrink-0 size-8"
            style={{
              backgroundImage: `url('/tooltip-lightbulb.svg')`,
            }}
          />
        </div>
        <div className="font-['Barlow:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#0d0e10] text-[14px] text-left w-full">
          <p className="block leading-[20px]">{text}</p>
        </div>
      </div>

      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
        <div className="h-1.5 relative shrink-0 w-12">
          <img alt="" className="block max-w-none size-full" src={imgFrame2147227025} />
        </div>

        <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative shrink-0">
          {onSkip && <ActionButton text="Skip" type="neutral" onClick={onSkip} />}
          {onNext && <ActionButton text="Next" type="accept" onClick={onNext} />}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[0px_-4px_0px_0px_inset_#0059ff]" />
    </div>
  );
};
