"use client";
import React, { useState } from "react";
import { TokenList } from "../Common/TokenList";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";

export function SelectTokenModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center rounded-2xl border border-solid bg-stone-900 border-zinc-800 h-[472px] w-[500px] max-md:h-auto max-md:max-w-[500px] max-md:min-h-[472px] max-md:w-[90%] max-sm:m-2.5 max-sm:h-auto max-sm:w-[95%]">
        {/* Header */}
        <header className="flex justify-between items-center self-stretch rounded-t-2xl pt-2.5 pr-2.5 pb-2 pl-4 border-b border-solid bg-zinc-800 border-b-neutral-900 max-md:pt-3 max-md:pr-3 max-md:pb-2.5 max-md:pl-5 max-sm:flex-wrap max-sm:pt-2.5 max-sm:pr-2.5 max-sm:pb-2 max-sm:pl-4">
          <div className="flex gap-1.5 items-center max-sm:gap-2">
            <div className="flex justify-center items-center p-0.5 w-5 h-5 rounded-md bg-neutral-900">
              <img src="/select-token-icon.svg" alt="" className="shrink-0 w-4 h-4" />
            </div>
            <h1 className="text-base font-medium tracking-tight leading-4 text-white max-md:text-base max-sm:text-sm">
              Choose token
            </h1>
          </div>
          <img src="/dark-close-icon.svg" alt="dark-close-icon" className="w-6 h-6" onClick={onClose} />
        </header>

        <main className="flex flex-col gap-3 items-start self-stretch px-1.5 pt-1.5 pb-5">
          {/* Token search input */}
          <div className="flex flex-col gap-1.5 items-start self-stretch px-1 py-0 rounded-xl bg-zinc-800">
            <div className="flex relative gap-2.5 items-center self-stretch px-1.5 py-3.5 rounded-lg backdrop-blur-[2px] max-md:px-4 max-md:py-4 max-sm:flex-col max-sm:gap-2 max-sm:px-3.5 max-sm:py-3">
              <label className="text-base tracking-tight leading-5 flex-[1_0_0] text-neutral-600 max-md:text-base max-sm:text-sm max-sm:text-center">
                Token name or address
              </label>
              <button className="flex gap-1.5 justify-center items-center px-2.5 pt-1.5 pb-2 bg-blue-500 rounded-xl shadow max-sm:self-stretch max-sm:px-3 max-sm:py-2">
                <span className="text-sm font-medium tracking-normal leading-3 text-white">Search</span>
              </button>
            </div>
          </div>
          <TokenList />
        </main>
      </div>
    </div>
  );
}

export default SelectTokenModal;
