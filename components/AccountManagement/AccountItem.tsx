"use client";
import * as React from "react";

interface AccountItemProps {
  name: string;
  signers: string;
  threshold: string;
  isSelected: boolean;
}

export function AccountItem({ name, signers, threshold, isSelected }: AccountItemProps) {
  return (
    <div
      className={`flex gap-2.5 items-center self-stretch px-3 py-2 rounded-xl ${isSelected ? "bg-[#B5E0FF]" : "bg-[#3D3D3D]"} cursor-pointer`}
    >
      <img
        src="/group-payment/default-group-payment-avatar.svg"
        className="shrink-0 aspect-[33.58/33.58] h-[34px] w-[34px] rounded-full"
      />
      <div className="flex flex-col gap-0.5 justify-center items-start flex-[1_0_0] ">
        <h3 className={`text-base font-medium leading-4 text-center ${isSelected ? "text-zinc-800" : "text-white"}`}>
          {name}
        </h3>
        <div className="flex gap-2 items-center self-stretch">
          <span
            className={`text-base tracking-tight leading-5 ${isSelected ? "text-neutral-600" : "text-neutral-400"}`}
          >
            {signers}
          </span>
          <span
            className={`text-base tracking-tight leading-5 ${isSelected ? "text-neutral-600" : "text-neutral-400"}`}
          >
            {threshold}
          </span>
        </div>
      </div>
      {isSelected && (
        <img
          src="/arrow/filled-arrow-right.svg"
          className="w-6 h-6 filter-blue"
          style={{
            filter: "invert(41%) sepia(98%) saturate(7492%) hue-rotate(186deg) brightness(102%) contrast(101%)",
          }}
        />
      )}
    </div>
  );
}
