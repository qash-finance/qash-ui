"use client";
import React from "react";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import SchedulePaymentCard from "@/components/SchedulePayment/SchedulePaymentCard";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import {
  MODAL_IDS,
  RecurringTransferItem,
  RecurringTransferModalProps,
  RecurringTransferTransaction,
} from "@/types/modal";

const qashToken: AssetWithMetadata = {
  amount: "0",
  faucetId: QASH_TOKEN_ADDRESS,
  metadata: { symbol: QASH_TOKEN_SYMBOL, decimals: QASH_TOKEN_DECIMALS, maxSupply: QASH_TOKEN_MAX_SUPPLY },
};

const EmptySchedulePayments = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[270px]">
      <img src="/modal/finder-question-mark.svg" alt="no schedule payments" className="w-12 h-12" />
      <span className="text-[#989898] text-[16px] tracking-[-0.32px]">Recurring transfer list is empty</span>
    </div>
  );
};

export function RecurringTransferModal({ isOpen, onClose, zIndex }: ModalProp<RecurringTransferModalProps>) {
  if (!isOpen) return null;

  const { openModal } = useModal();

  const items: RecurringTransferItem[] = [
    {
      recipientName: "(Nam) 0x23C...15g63",
      amount: "3000",
      token: qashToken,
      frequencyLabel: "Monthly",
      startDateLabel: "From 01/08/2025",
      timesLabel: "3 times",
    },
    {
      recipientName: "(Nam) 0x23C...15g63",
      amount: "0.001",
      token: qashToken,
      frequencyLabel: "Monthly",
      startDateLabel: "From 01/09/2025",
      timesLabel: "2 times",
    },
    {
      recipientName: "(Nam) 0x23C...15g63",
      amount: "0.001",
      token: qashToken,
      frequencyLabel: "Monthly",
      startDateLabel: "From 02/10/2025",
      timesLabel: "2 times",
    },
  ];

  const transactionsMap: Record<number, RecurringTransferTransaction[]> = {
    0: [
      { amountLabel: "1000 BTC", claimableAfterLabel: "Claimable after 01/08/2025" },
      { amountLabel: "1000 BTC", claimableAfterLabel: "Claimable after 01/09/2025" },
      { amountLabel: "1000 BTC", claimableAfterLabel: "Claimable after 01/10/2025" },
    ],
    1: [
      { amountLabel: "0.0005 BTC", claimableAfterLabel: "Claimable after 01/09/2025" },
      { amountLabel: "0.0005 BTC", claimableAfterLabel: "Claimable after 01/10/2025" },
    ],
    2: [
      { amountLabel: "0.0005 BTC", claimableAfterLabel: "Claimable after 02/10/2025" },
      { amountLabel: "0.0005 BTC", claimableAfterLabel: "Claimable after 02/11/2025" },
    ],
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Back"
      icon="/arrow/chevron-left.svg"
      zIndex={zIndex}
      onClickIcon={onClose}
    >
      <div className="flex w-full bg-[#1E1E1E] rounded-b-xl">
        <div className="flex flex-col gap-[5px] bg-[#292929] rounded-xl py-5 w-[520px] max-md:w-[90%] mt-1.5">
          {/* Header */}
          <div className="flex items-center justify-between w-full cursor-pointer">
            <div className="px-4">
              <span className="text-white text-[16px] tracking-[-0.32px]">
                Recurring Transfer List ({items.length})
              </span>
            </div>
            {items.length > 0 && (
              <button type="button" className="flex items-center gap-0.5 px-4 justify-center">
                <span className="text-[16px] text-[#1e8fff]">See all</span>
                <img src={`/arrow/chevron-right.svg`} alt="chevron-right" className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* List */}
          {items.length > 0 ? (
            <div className="flex flex-col gap-[5px] px-1.5 py-4">
              {items.map((it, idx) => (
                <div key={idx} className="w-full">
                  <SchedulePaymentCard
                    recipientName={it.recipientName}
                    amount={it.amount}
                    token={it.token}
                    frequencyLabel={it.frequencyLabel}
                    startDateLabel={it.startDateLabel}
                    timesLabel={it.timesLabel}
                    onClick={() =>
                      openModal(MODAL_IDS.RECURRING_TRANSFER_DETAIL, {
                        item: it,
                        transactions: transactionsMap[idx],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptySchedulePayments />
          )}
        </div>
      </div>
    </BaseModal>
  );
}

export default RecurringTransferModal;
