"use client";

import * as React from "react";

interface TransactionRowProps {
  id: string;
  amount: string;
  dateTime: string;
  link: string;
  isOpened?: boolean;
  onCopyLink?: (link: string) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  id,
  amount,
  dateTime,
  link,
  isOpened = false,
  onCopyLink,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    onCopyLink?.(link);
  };

  return (
    <div className="flex gap-1.5 items-center self-stretch py-2 pr-2 pl-4 rounded-xl bg-[#292929] max-md:flex-wrap max-md:gap-2 max-sm:p-2">
      <div className="flex flex-col gap-2.5 justify-center items-center p-1 w-7 h-7 rounded-lg bg-neutral-700">
        <div className="flex gap-1 items-center">
          <span className="text-sm font-medium leading-4 text-white">{id}</span>
        </div>
      </div>
      <div className="flex gap-1 items-center flex-[1_0_0]">
        <img src="/token/usdt.svg" alt="usdt" className="w-6 h-6" />
        <span className="text-xl leading-6 text-center text-white">{amount}</span>
        {isOpened && (
          <div className="flex gap-0.5 justify-center items-center px-1.5 py-1.5 bg-blend-luminosity bg-[#3F3F3F] bg-opacity-10 rounded-[34px]">
            <span className="text-xs font-medium tracking-tight leading-4 text-stone-300">Opened</span>
          </div>
        )}
      </div>
      <div className="overflow-hidden text-sm tracking-tight leading-4 text-center text-ellipsis text-stone-300 w-[119px] max-md:w-auto">
        {dateTime}
      </div>

      {/* Copy link */}
      <div
        className={`flex gap-2 items-center py-1.5 pr-1.5 pl-3 w-56 rounded-xl max-md:w-full max-md:max-w-[300px] max-sm:w-full max-sm:max-w-[250px] ${
          isOpened ? "bg-[#696969]" : "bg-white"
        }`}
      >
        <div
          className={`overflow-hidden text-sm font-medium leading-4  flex-[1_0_0] text-ellipsis ${
            isOpened ? "text-[#1F3E69]" : "text-blue-600"
          }`}
        >
          {link}
        </div>
        <button
          className={`flex gap-1.5 justify-center items-center px-2 py-1 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
            isOpened ? "bg-[#1F3E69]" : "bg-blue-600"
          }`}
          onClick={handleCopy}
        >
          <span className={`text-sm font-medium tracking-tight leading-4 text-white`}>Copy link</span>
          <img src="/copy-icon.svg" alt="copy" className="w-4 h-4" style={{ filter: "invert(1) brightness(1000%)" }} />
        </button>
      </div>
    </div>
  );
};
