"use client";

import React, { useEffect } from "react";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/web3/useAccount";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useBalanceVisibility } from "@/contexts/BalanceVisibilityProvider";
import { ThemeToggle } from "../Common/ThemeToggle";
import { ActionButton } from "../Common/ActionButton";
import { SecondaryButton } from "../Common/SecondaryButton";

export function WalletHeader({ onClose }: { onClose: () => void }) {
  // **************** Custom Hooks *******************
  const { accountBalance, forceFetch, loading } = useAccount();
  const router = useRouter();
  const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();

  return (
    <header className="flex relative flex-col gap-4 items-start w-full p-2  rounded-2xl">
      {/* Wallet Header */}
      <div className="flex gap-2 items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <span className=" text-text-primary text-2xl">Portfolio</span>
          {loading ? (
            <img src="/portfolio/loading-icon.gif" alt="loading" className="w-6 h-6" />
          ) : (
            <img
              src="/portfolio/loading-icon.svg"
              alt="loading"
              className="w-4 h-4 cursor-pointer"
              onClick={() => forceFetch()}
            />
          )}
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <div className="w-[1px] h-5 bg-text-secondary rotate-180" />
          <img src="/misc/close-icon.svg" alt="close" className="w-5 h-5 opacity-50 cursor-pointer" onClick={onClose} />
        </div>
      </div>
      {/* Wallet Info */}
      <section className="flex relative flex-col gap-1 items-start self-stretch z-[1]">
        <div className="flex gap-2 items-center self-stretch">
          <h1 className="text-base font-medium leading-6 text-center text-text-secondary">Total balance</h1>
          <button className="cursor-pointer" onClick={toggleBalanceVisibility} aria-label="Toggle balance visibility">
            <img
              src={isBalanceVisible ? "/portfolio/eye-icon.svg" : "/portfolio/eye-icon-closed.svg"}
              alt={isBalanceVisible ? "hide balance" : "show balance"}
              className="w-5 h-5"
            />
          </button>
        </div>

        <div className={`flex gap-2 items-center self-stretch ${isBalanceVisible ? "mb-0" : "mb-8"}`}>
          <span className="text-4xl leading-9 text-text-secondary uppercase">$</span>
          {isBalanceVisible ? (
            <span className="text-4xl font-bold tracking-tighter leading-9 text-text-primary uppercase">
              {formatNumberWithCommas(accountBalance)}
            </span>
          ) : (
            <div className="flex gap-1 items-center">
              {[...Array(4)].map((_, index) => (
                <img key={index} src="/token/qash.svg" alt="qash icon" className="w-8 h-8" />
              ))}
            </div>
          )}
        </div>

        {isBalanceVisible && (
          <div className="flex gap-1 items-center self-stretch">
            <span className="text-base font-medium leading-4 text-[#1DAF61]">+$126.40</span>
            <div className="flex gap-1 justify-center items-center px-2 py-1.5 bg-[#CEF9D8] border border-[#83FFA0] rounded-full">
              <span className="text-sm font-semibold leading-none text-[#007B4B]">1.25%</span>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex gap-1 justify-center items-center w-full">
        <PrimaryButton
          text="Receive"
          icon="/misc/receive-icon.svg"
          iconPosition="left"
          onClick={() => router.push("/move-crypto?tab=receive")}
          containerClassName="flex-1"
        />

        <SecondaryButton
          text="Send"
          icon="/sidebar/move-crypto.svg"
          iconPosition="left"
          onClick={() => router.push("/move-crypto?tab=send")}
          buttonClassName="flex-1"
          iconClassName="invert brightness(1000%)"
        />
      </div>
    </header>
  );
}
