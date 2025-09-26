"use client";

import React, { useEffect, useRef, useState } from "react";
import TransactionDetail from "./TransactionDetail";
import TopInteractedAddresses from "./TopInteractedAddresses";
import SpendingAverageChart from "./SpendingAverageChart";
import GeneralStatistics from "./GeneralStatistics";
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

  useEffect(() => {
    if (!accountId || !client) return;

    (async () => {
      const { NetworkId, AccountInterface, TransactionFilter, NoteFilter, NoteFilterTypes, WebClient } = await import(
        "@demox-labs/miden-sdk"
      );
      console.log("Fetching transactions for account:", accountId);
      setLoading(true);
      try {
        if (client instanceof WebClient) {
          console.log("ACCOUNT ID", accountId);
          const transactionRecords = (await client.getTransactions(TransactionFilter.all())).filter(
            tx => tx.accountId().toBech32(NetworkId.Testnet, AccountInterface.Unspecified) === accountId,
          );
          const inputNotes = await client.getInputNotes(new NoteFilter(NoteFilterTypes.All));
          const zippedInputeNotesAndTr = transactionRecords.map(tr => {
            if (tr.outputNotes().notes().length > 0) {
              return { tr, inputNote: undefined };
            } else {
              const inputNotesForTr = inputNotes.filter(note => note.consumerTransactionId() === tr.id().toHex());
              return { tr, inputNote: inputNotesForTr };
            }
          });
          await loadTransactions(zippedInputeNotesAndTr);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [client, accountId]);

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
    <div className="custom-scrollbar flex flex-col gap-2 items-start justify-start overflow-y-scroll w-full h-full p-2 bg-black">
      {/* Top Row - Cards */}
      <div className="flex 2xl:flex-row flex-col gap-[5px] h-full 2xl:h-[250px] items-start w-full">
        <GeneralStatistics timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
        <TopInteractedAddresses />
        <SpendingAverageChart />
      </div>

      {/* Bottom Row - Transaction History or Transaction Detail */}
      <div className="relative w-full min-h-[500px] flex-1 overflow-x-hidden rounded-lg">
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
