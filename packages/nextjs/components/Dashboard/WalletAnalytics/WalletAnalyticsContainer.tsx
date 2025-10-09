"use client";

import React, { useEffect, useRef, useState } from "react";
import TransactionDetail from "./TransactionDetail";
import TopInteractedAddresses from "../../Home/Overview/TopInteractedAddresses";
import SpendingAverageChart from "../../Home/Overview/SpendingAverageChart";
import GeneralStatistics from "../../Home/Overview/GeneralStatistics";
import TransactionHistory from "./TransactionHistory";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { useAccount } from "@/hooks/web3/useAccount";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { UITransaction } from "@/services/store/transaction";
import { useEscapeKey } from "@/hooks/web3/useEscapeKey";

const ANIMATION_DURATION = 300;

export const WalletAnalyticsContainer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { accountId } = useAccount();
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const client = useMidenSdkStore(state => state.client);
  const [selectedTransaction, setSelectedTransaction] = useState<UITransaction | null>(null);
  const [timePeriod, setTimePeriod] = useState<"month" | "year">("month");
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  /************** Effects **************/

  /************** Handlers **************/

  const handleTransactionClick = (transaction: UITransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
    setIsAnimating(true);

    // Reset scroll position when switching to detail view
    const container = document.querySelector(".wallet-analytics-container");
    if (container) {
      container.scrollTop = 0;
    }

    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  };

  const handleBackToHistory = () => {
    setIsAnimating(true);
    setShowTransactionDetail(false);

    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  };

  // Add ESC key handler
  useEscapeKey(handleBackToHistory, showTransactionDetail);

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full h-full p-2 bg-black">
      {/* Top Row - Cards */}
      <div className="flex flex-row gap-[5px] h-[250px] items-start w-full">
        <GeneralStatistics timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
        <TopInteractedAddresses />
        <SpendingAverageChart />
      </div>

      {/* Bottom Row - Transaction History or Transaction Detail */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg">
        {/* Transaction History */}
        <div
          className={`transition-transform duration-[${ANIMATION_DURATION}ms] ease-in-out h-full ${
            showTransactionDetail ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <TransactionHistory onTransactionClick={handleTransactionClick} />
          </div>
        </div>

        {/* Transaction Detail - Slides in from right */}
        <div
          className={`absolute inset-0 transition-transform duration-[${ANIMATION_DURATION}ms] ease-in-out h-full ${
            showTransactionDetail ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {(showTransactionDetail || isAnimating) && selectedTransaction && (
            <div className="h-full overflow-y-auto">
              <TransactionDetail transaction={selectedTransaction} onBack={handleBackToHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
