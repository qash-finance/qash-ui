"use client";
import * as React from "react";
import { ToggleSwitch } from "../Common/ToggleSwitch";

export function ModulesList() {
  const [whitelisting, setWhitelisting] = React.useState(true);
  const [spendingLimits, setSpendingLimits] = React.useState(false);
  const [timelockTransfer, setTimelockTransfer] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-1.5 content-start items-start self-stretch rounded-2xl max-sm:flex-col">
      <div className="flex gap-2 justify-center items-center px-3 py-1.5 h-10 bg-white rounded-xl max-sm:w-full">
        <span className="text-base font-medium tracking-tight leading-5 text-blue-600">Whitelisting</span>
        <ToggleSwitch enabled={whitelisting} onChange={setWhitelisting} />
      </div>

      <div className="flex gap-2 justify-center items-center px-3 py-1.5 h-10 bg-[#949494] rounded-xl max-sm:w-full">
        <span className="text-base font-medium tracking-tight leading-5 text-zinc-700">Spending limits</span>
        <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
          <span className="text-sm tracking-tight leading-5 text-[#949494]">Upcoming</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center px-3 py-1.5 h-10 bg-[#949494] rounded-xl max-sm:w-full">
        <span className="text-base font-medium tracking-tight leading-5 text-zinc-700">Timelock transfer</span>
        <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
          <span className="text-sm tracking-tight leading-5 text-[#949494]">Upcoming</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center px-3 py-1.5 h-10 bg-white rounded-xl max-sm:w-full">
        <span className="text-base font-medium tracking-tight leading-5 text-zinc-700">+30</span>
      </div>
    </div>
  );
}
