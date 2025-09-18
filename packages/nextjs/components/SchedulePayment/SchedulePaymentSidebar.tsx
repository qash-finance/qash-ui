"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { SchedulePaymentSidebarProps } from "@/types/modal";
import { ActionButton } from "../Common/ActionButton";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useAccountContext } from "@/contexts/AccountProvider";
import { consumeNoteByID, consumeNoteByIDs } from "@/services/utils/miden/note";
import { RecallableNoteType, TransactionStatus } from "@/types/transaction";
import toast from "react-hot-toast";
import { useRecallBatch } from "@/services/api/transaction";

interface ScheduledTransactionItemProps {
  transactionNumber: number;
  status: TransactionStatus | "ready_to_claim";
  amount: string;
  claimableDate: string;
  recallableTime: string;
  onCancel: () => void;
}

const Item: React.FC<ScheduledTransactionItemProps> = ({
  transactionNumber,
  status,
  amount,
  claimableDate,
  recallableTime,
  onCancel,
}) => {
  const getStatusColor = (status: TransactionStatus | "ready_to_claim") => {
    const colorMap = {
      [TransactionStatus.CONSUMED]: "text-[#09DE34]",
      [TransactionStatus.PENDING]: "text-[#FFB700]",
      [TransactionStatus.RECALLED]: "text-[#FF0000]",
      ready_to_claim: "text-[#1E8FFF]",
    };
    return colorMap[status] || "text-[#FFB700]";
  };

  const getStatusDisplay = (status: TransactionStatus | "ready_to_claim") => {
    const statusMap = {
      [TransactionStatus.CONSUMED]: "Claimed",
      [TransactionStatus.PENDING]: "Pending Send",
      [TransactionStatus.RECALLED]: "Cancelled",
      ready_to_claim: "Pending Claim",
    };
    return statusMap[status] || status;
  };

  const isTimelocked: boolean = Date.now() < new Date(recallableTime).getTime();
  const isDisabled = status === TransactionStatus.RECALLED || status === TransactionStatus.CONSUMED || isTimelocked;

  return (
    <div className="bg-[#1e1e1e] flex flex-col gap-1 items-start justify-center px-3 py-5 rounded-lg w-full relative">
      <div className="absolute inset-0 border-[#3d3d3d] border-b border-solid rounded-lg pointer-events-none" />
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex gap-4 items-center">
            <div className="bg-[#066eff] w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src="/modal/coin-icon.gif"
                alt="qash"
                className="w-6 h-6"
                style={{ filter: "invert(1) brightness(1000%)" }}
              />
            </div>
            <div className="flex flex-col text-sm font-medium">
              <div className="text-white leading-5 tracking-[0.07px]">Transaction #{transactionNumber}</div>
              <div className={`leading-5 ${getStatusColor(status)}`}>{getStatusDisplay(status)}</div>
            </div>
          </div>
          <ActionButton text="Cancel" onClick={onCancel} type="neutral" disabled={isDisabled} />
        </div>
        <div className="flex gap-2 items-center justify-end">
          <div className="bg-[#3d3d3d] flex gap-2.5 items-center justify-center px-4 py-1.5 rounded-md">
            <div className="text-white text-sm font-medium tracking-[0.07px] leading-5">{amount}</div>
          </div>
          <div className="bg-[#3d3d3d] flex gap-2.5 items-center justify-center px-4 py-1.5 rounded-md">
            <div className="text-white text-sm font-medium tracking-[0.07px] leading-5">
              Claimable after {claimableDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchedulePaymentSidebar = ({ isOpen, onClose, schedulePaymentData }: ModalProp<SchedulePaymentSidebarProps>) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { accountId } = useAccountContext();
  const { mutateAsync: recallBatch } = useRecallBatch();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  const handleCancelSchedule = async () => {
    if (!accountId) {
      toast.error("Account not connected.");
      return;
    }

    toast.loading("Cancelling schedule...");
    try {
      // Get all recallable transactions (filter out create transactions)
      const recallableTransactions = schedulePaymentData.transactions.filter(
        tx => !tx.id.includes("creation") && tx.status !== TransactionStatus.RECALLED,
      );

      if (recallableTransactions.length === 0) {
        toast.dismiss();
        toast.error("No transactions to cancel.");
        return;
      }

      // Process each transaction sequentially
      const txIds = await consumeNoteByIDs(
        accountId,
        recallableTransactions.map(tx => tx.noteId),
      );

      await recallBatch({
        items: recallableTransactions.map(tx => ({
          type: RecallableNoteType.SCHEDULE_PAYMENT,
          id: Number(tx.id),
        })),
        txId: txIds,
      });

      toast.dismiss();
      toast.success("Schedule cancelled successfully!");
      onClose();
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      toast.dismiss();
      toast.error("Failed to cancel schedule.");
    } finally {
      toast.dismiss();
    }
  };

  // Transform transactions data for display
  const transformedTransactions = schedulePaymentData.transactions
    .filter(tx => !tx.id.includes("creation")) // Filter out create transactions
    .map((tx, index) => {
      let claimableDate = tx.date;
      const status = tx.status;

      const handleCancelTransaction = async () => {
        if (!accountId) {
          toast.error("Account not connected.");
          return;
        }

        if (status === TransactionStatus.RECALLED) {
          toast.error("Transaction already cancelled.");
          return;
        }

        toast.loading("Cancelling transaction...");
        try {
          // Consume the note to get transaction ID
          const txId = await consumeNoteByID(accountId, tx.id);

          // Recall the transaction on server
          await recallBatch({
            items: [
              {
                type: RecallableNoteType.SCHEDULE_PAYMENT,
                id: Number(tx.id),
              },
            ],
            txId: txId,
          });

          toast.dismiss();
          toast.success("Transaction cancelled successfully!");

          // Refresh the modal data or close it
          onClose();
        } catch (error) {
          console.error("Error cancelling transaction:", error);
          toast.dismiss();
          toast.error("Failed to cancel transaction.");
        }
      };

      return {
        transactionNumber: index + 1,
        status,
        amount: `${tx.amount || schedulePaymentData.totalAmount} ${schedulePaymentData.currency}`,
        claimableDate,
        recallableTime: tx.recallableTime,
        onCancel: handleCancelTransaction,
      };
    });

  return (
    <div
      data-tour="portfolio-section"
      className="fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out
        ${isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}
      `}
        style={{ zIndex: 1 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-[#1E1E1E] h-full w-[470px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2 }}
      >
        {/* Back Navigation */}
        <nav
          className="flex relative flex-col shrink-0 justify-center items-center self-stretch px-2 py-0 rounded-2xl bg-black w-[42px] cursor-pointer"
          onClick={handleClose}
        >
          <button className="flex absolute justify-center items-center w-7 h-7 top-1/2" aria-label="Close">
            <img src="/close-icon.svg" alt="close-icon" className="w-7 h-7" />
          </button>
        </nav>

        {/* Main Content */}
        <div className="bg-[#292929] flex flex-col gap-5 items-center justify-start overflow-clip pb-2 pt-10 px-2 rounded-2xl w-full h-full">
          {/* Recipient Section */}
          <div className="flex flex-col gap-2 items-center">
            <div
              className="w-20 h-20 rounded-[100px] bg-no-repeat bg-center bg-cover"
              style={{
                backgroundImage: `url(${blo(turnBechToHex(schedulePaymentData.recipient.address))})`,
              }}
            />
            <div className="flex flex-col gap-1.5 items-center text-center">
              <div className="text-[#989898] text-sm tracking-[0.07px] leading-5">Recipient</div>
              <div className="text-white text-xl tracking-[0.1px] leading-5 font-medium">
                {schedulePaymentData.recipient.address}
              </div>
            </div>
          </div>

          {/* Cancel Schedule Button */}
          <ActionButton text="Cancel Schedule" onClick={handleCancelSchedule} type="deny" className="h-9" />

          {/* Transactions Container */}
          <div className="bg-[#0c0c0c] flex flex-col gap-5 grow w-full rounded-2xl p-3">
            {/* Wallet Info Header */}
            <div className="flex gap-2 items-center justify-between w-full">
              <div className="flex gap-2 items-center grow">
                <div className="text-white text-sm text-center font-medium leading-[22px]">Total amount</div>
              </div>
              <div className="flex gap-2 items-center">
                <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
                <div className="flex flex-col justify-center text-white text-xl font-medium tracking-[-0.6px] uppercase leading-none">
                  {schedulePaymentData.totalAmount} {schedulePaymentData.currency}
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-1 w-full">
              {transformedTransactions.map(transaction => (
                <Item
                  key={transaction.transactionNumber}
                  transactionNumber={transaction.transactionNumber}
                  status={transaction.status}
                  amount={transaction.amount}
                  claimableDate={transaction.claimableDate}
                  recallableTime={transaction.recallableTime}
                  onCancel={transaction.onCancel}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchedulePaymentSidebar;
