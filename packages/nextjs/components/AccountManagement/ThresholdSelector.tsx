"use client";
import * as React from "react";

export function ThresholdSelector() {
  return (
    <section className="flex gap-5 items-center self-stretch max-sm:flex-col max-sm:gap-2.5 max-sm:items-start">
      <div className="flex flex-col gap-1 justify-center items-start flex-[1_0_0]">
        <h3 className="text-base font-medium leading-4 text-center text-white">Threshold</h3>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500">
          Any transaction requires the confirmation of
        </p>
      </div>

      <div className="flex items-center justify-between gap-1 h-11 rounded-xl border border-[#656565] bg-stone-900 w-full max-w-[245px] px-2">
        <div className="flex flex-row gap-1 items-center justify-between flex-2 mr-4">
          <img src="/minus-icon.svg" alt="minus-icon" className="w-5 h-5" />
          <span className="flex-1 text-base text-center text-white">03</span>
          <img src="/plus-icon.svg" alt="plus-icon" className="w-5 h-5" />
        </div>
        <span className="h-full w-px bg-[#656565] self-stretch" aria-hidden="true" />;
        <span className="flex-2/10 text-base font-medium text-neutral-500 text-center">6 Co-Owners</span>
      </div>
    </section>
  );
}
