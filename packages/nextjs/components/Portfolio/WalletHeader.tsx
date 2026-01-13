"use client";

import React from "react";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { useBalanceVisibility } from "@/contexts/BalanceVisibilityProvider";
import { useMidenProvider } from "@/contexts/MidenProvider";

export function WalletHeader({ onClose, onChooseAccount }: { onClose: () => void; onChooseAccount: () => void }) {
  // **************** Custom Hooks *******************
  const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();
  // const blockNumber = 0;
  // const transactions = useTransactionStore(state => state.transactions);
  const { balances, balancesLoading, fetchBalances } = useMidenProvider();
  // const { moneyIn, moneyOut } = useMemo(() => {
  //   if (!blockNumber) {
  //     return { moneyIn: 0, moneyOut: 0 };
  //   }

  //   const currentDate = new Date();
  //   const secondsPerDay = 24 * 60 * 60;
  //   const blocksPerDay = secondsPerDay / 5;

  //   let filteredTransactions = [];

  //   // Calculate current month's block range
  //   const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //   const daysFromStartOfMonth = Math.floor((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
  //   const blocksFromStartOfMonth = Math.floor(blocksPerDay * daysFromStartOfMonth);
  //   const monthStartBlock = blockNumber - blocksFromStartOfMonth;

  //   filteredTransactions = transactions.filter(tx => {
  //     const txBlockNumber = parseInt(tx.blockNumber);
  //     return txBlockNumber >= monthStartBlock && txBlockNumber <= blockNumber;
  //   });

  //   let moneyIn = 0;
  //   let moneyOut = 0;

  //   filteredTransactions.forEach(tx => {
  //     // Process all assets in the transaction, not just QASH
  //     tx.assets.forEach(asset => {
  //       // Find the asset metadata to get the correct decimals
  //       const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
  //       if (assetMetadata) {
  //         const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

  //         if (tx.type === "Incoming" || tx.type === "Faucet") {
  //           moneyIn += assetAmount;
  //         } else if (tx.type === "Outgoing") {
  //           moneyOut += assetAmount;
  //         }
  //       }
  //     });
  //   });

  //   return {
  //     moneyIn,
  //     moneyOut,
  //   };
  // }, [transactions, blockNumber, assets]);

  // // Calculate percentage changes compared to previous period
  // const { moneyInChange, moneyOutChange } = useMemo(() => {
  //   if (!blockNumber) {
  //     return { moneyInChange: 0, moneyOutChange: 0 };
  //   }

  //   const currentDate = new Date();
  //   const secondsPerDay = 24 * 60 * 60;
  //   const blocksPerDay = secondsPerDay / 5;

  //   let previousPeriodTransactions = [];

  //   // Calculate previous month's block range
  //   const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //   const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  //   const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  //   const daysFromStartOfCurrentMonth = Math.floor(
  //     (currentDate.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24),
  //   );
  //   const daysFromStartOfPreviousMonth = Math.floor(
  //     (startOfCurrentMonth.getTime() - startOfPreviousMonth.getTime()) / (1000 * 60 * 60 * 24),
  //   );

  //   const previousMonthEndBlock = blockNumber - Math.floor(blocksPerDay * daysFromStartOfCurrentMonth);
  //   const previousMonthStartBlock =
  //     blockNumber - Math.floor(blocksPerDay * (daysFromStartOfCurrentMonth + daysFromStartOfPreviousMonth));

  //   previousPeriodTransactions = transactions.filter(tx => {
  //     const txBlockNumber = parseInt(tx.blockNumber);
  //     return txBlockNumber >= previousMonthStartBlock && txBlockNumber <= previousMonthEndBlock;
  //   });

  //   let previousMoneyIn = 0;
  //   let previousMoneyOut = 0;

  //   previousPeriodTransactions.forEach(tx => {
  //     // Process all assets in the transaction, not just QASH
  //     tx.assets.forEach(asset => {
  //       // Find the asset metadata to get the correct decimals
  //       const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
  //       if (assetMetadata) {
  //         const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

  //         if (tx.type === "Incoming" || tx.type === "Faucet") {
  //           previousMoneyIn += assetAmount;
  //         } else if (tx.type === "Outgoing") {
  //           previousMoneyOut += assetAmount;
  //         }
  //       }
  //     });
  //   });

  //   const moneyInChange = previousMoneyIn > 0 ? ((moneyIn - previousMoneyIn) / previousMoneyIn) * 100 : 0;
  //   const moneyOutChange = previousMoneyOut > 0 ? ((moneyOut - previousMoneyOut) / previousMoneyOut) * 100 : 0;

  //   return { moneyInChange, moneyOutChange };
  // }, [transactions, blockNumber, moneyIn, moneyOut]);

  return (
    <header className="flex relative flex-col gap-4 items-start w-full p-2  rounded-2xl">
      {/* Wallet Header */}
      <div className="flex gap-2 items-center justify-between w-full">
        <div
          className="flex gap-2 items-center rounded-full bg-background px-2 py-1 cursor-pointer"
          onClick={onChooseAccount}
        >
          <img src="/portfolio/account-icon.svg" alt="wallet icon" className="w-5" />
          <div className=" leading-none text-text-primary">Account 1</div>
          <img src="/arrow/chevron-down.svg" alt="wallet icon" className="w-4" />
        </div>
        <div className="flex gap-3 items-center">
          {/* <ThemeToggle /> */}
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
              {formatNumberWithCommas(balances?.totalUsd || 0)}
            </span>
          ) : (
            <div className="flex gap-1 items-center">
              {[...Array(4)].map((_, index) => (
                <img key={index} src="/token/qash.svg" alt="qash icon" className="w-8 h-8" />
              ))}
            </div>
          )}
        </div>

        {/* {isBalanceVisible && (
          <div className="flex gap-1 items-center self-stretch">
            <div className="flex flex-row gap-2 items-center">
              <span className="font-medium text-[#02BE75] text-base">+${moneyInChange.toFixed(2)}</span>
              <Badge status={BadgeStatus.SUCCESS} text={`${moneyInChange.toFixed(2)}%`} />
            </div>
          </div>
        )} */}
      </section>

      {/* Action Buttons */}
      {/* <div className="flex gap-1 justify-center items-center w-full">
        <PrimaryButton
          text="Receive"
          icon="/misc/receive-icon.svg"
          iconPosition="left"
          onClick={() => {
            router.push("/move-crypto?tab=receive");
            closeModal(MODAL_IDS.PORTFOLIO);
          }}
          containerClassName="flex-1"
        />

        <SecondaryButton
          text="Send"
          icon="/sidebar/move-crypto.svg"
          iconPosition="left"
          onClick={() => {
            router.push("/move-crypto?tab=send");
            closeModal(MODAL_IDS.PORTFOLIO);
          }}
          buttonClassName="flex-1"
          iconClassName="invert brightness(1000%)"
        />
      </div> */}
    </header>
  );
}
