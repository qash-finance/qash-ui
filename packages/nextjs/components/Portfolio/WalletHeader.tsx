"use client";

import React, { useEffect, useState } from "react";
import { getAccountById } from "@/services/utils/miden/account";
import { AccountId } from "@demox-labs/miden-sdk";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/web3/useAccount";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";

export function WalletHeader() {
  // **************** Custom Hooks *******************
  const { walletAddress } = useWalletAuth();
  const { accountBalance } = useAccount();
  const router = useRouter();

  // **************** Local State *******************
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  useEffect(() => {
    // Load balance visibility preference from localStorage
    const storedVisibility = localStorage.getItem("balanceVisibility");
    if (storedVisibility !== null) {
      setIsBalanceVisible(storedVisibility === "true");
    }
  }, []);

  useEffect(() => {
    (async () => {})();
  }, [walletAddress]);

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
    localStorage.setItem("balanceVisibility", newVisibility.toString());
  };

  const displayBalance = () => {
    if (isBalanceVisible) {
      return accountBalance;
    }
    return "****";
  };

  return (
    <header
      className="flex relative flex-col gap-4 items-start w-full p-2 bg-blue-600 rounded-2xl max-sm:gap-4 max-sm:p-2"
      style={{
        backgroundImage: "url('/portfolio/portfolio-background-icon.svg')",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Wallet Info */}
      <section className="flex relative flex-col gap-3 items-start self-stretch z-[1]">
        <div className="flex gap-2 items-center self-stretch">
          <h1 className="text-base font-medium leading-6 text-center text-white">Wallet balance</h1>
          <button className="cursor-pointer" onClick={toggleBalanceVisibility} aria-label="Toggle balance visibility">
            <img
              src={isBalanceVisible ? "/portfolio/eye-icon.svg" : "/portfolio/eye-icon-closed.svg"}
              alt={isBalanceVisible ? "hide balance" : "show balance"}
              className="w-5 h-5"
            />
          </button>
        </div>

        <div className="flex gap-2 items-center self-stretch">
          <span className="text-4xl leading-9 text-white uppercase max-sm:text-3xl">$</span>
          <span className="text-4xl font-medium tracking-tighter leading-9 text-white uppercase max-sm:text-3xl">
            {isBalanceVisible ? formatNumberWithCommas(displayBalance()) : displayBalance()}
          </span>
        </div>

        {/* TODO: REMOVE COMMENT */}
        {/* <div className="flex gap-1 items-center self-stretch">
          <span className="text-base font-medium leading-4 text-[#7CFF96]">+$126.40</span>
          <div className="flex gap-1 justify-center items-center px-2 py-1.5 bg-white rounded-xl">
            <span className="text-sm font-semibold tracking-tight leading-5 text-green-700">1.25%</span>
          </div>
        </div> */}
      </section>

      {/* Action Buttons */}
      <div className="flex relative gap-1 justify-center items-center w-full p-1 rounded-2xl backdrop-blur-[15.35px] bg-[#012F87] bg-opacity-50 z-[1] max-sm:p-1">
        <button
          onClick={() => router.push("/send")}
          className="flex gap-1.5 justify-center items-center px-6 py-2.5 rounded-xl border-solid bg-blend-luminosity bg-[#204997] flex-[1_0_0] max-sm:px-4 max-sm:py-2 cursor-pointer"
        >
          <img src="/arrow/thin-arrow-up.svg" alt="send-icon" className="w-5 h-5" />
          <span className="text-base leading-5 text-white">Send</span>
        </button>

        <button className="cursor-not-allowed flex gap-1.5 justify-between items-center px-6 py-2.5 rounded-xl border-solid bg-blend-luminosity bg-[#204997] flex-[1_0_0] max-sm:px-4 max-sm:py-2">
          <img src="/arrow/thin-arrow-down.svg" alt="receive-icon" className="w-5 h-5" />
          <span className="text-base leading-5 text-white">Group Payment</span>
        </button>
      </div>
    </header>
  );
}
