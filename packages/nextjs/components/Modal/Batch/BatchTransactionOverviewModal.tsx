"use client";
import React, { useMemo } from "react";
import { BatchTransactionOverviewModalProps, MODAL_IDS } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { formatAddress } from "@/services/utils/miden/address";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { BatchTransaction, useBatchTransactions } from "@/services/store/batchTransactions";

export function BatchTransactionOverviewModal({
  isOpen,
  onClose,
  ...props
}: ModalProp<BatchTransactionOverviewModalProps>) {
  const { sender, onConfirm } = props;
  const { openModal } = useModal();

  const { walletAddress } = useWalletConnect();

  // Subscribe directly to the store state for automatic reactivity
  const allTransactions = useBatchTransactions(state => state.transactions);

  const transactions = useMemo(() => {
    if (walletAddress && allTransactions[walletAddress]) {
      return allTransactions[walletAddress].map(tx => ({
        ...tx,
        createdAt: new Date(tx.createdAt),
      }));
    }
    return [];
  }, [walletAddress, allTransactions]);

  const transactionTypes = useMemo(() => {
    if (transactions.length > 0) {
      const hasPrivate = transactions.some(transaction => transaction.isPrivate);
      const hasPublic = transactions.some(transaction => !transaction.isPrivate);

      const types: string[] = [];
      if (hasPrivate) types.push("Private");
      if (hasPublic) types.push("Public");
      return types;
    }
    return [];
  }, [transactions]);

  const cancellableTimes = useMemo(() => {
    if (transactions.length > 0) {
      return [
        ...new Set(
          transactions.map(transaction => {
            const hours = transaction.recallableTime / 3600;
            return hours === 1 ? "1 hour" : `${hours} hours`;
          }),
        ),
      ];
    }
    return [];
  }, [transactions]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Transaction Overview" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-1.5 bg-[#1E1E1E] rounded-b-2xl w-[520px]">
        {/* Transaction Details */}
        <div className="flex flex-col gap-1 w-full">
          {/* Account Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Account</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">
              {sender && formatAddress(sender)}
            </div>
          </div>

          {/* Recipient Row */}
          <div className="bg-[#292929] rounded-lg p-2 flex justify-between items-center">
            <span className="text-[#989898] text-sm font-normal">Recipent</span>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-[#3d3d3d] px-4 rounded-md">
                <span className="text-white text-sm font-medium rounded-md -mt-0.5">
                  {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
              <img
                alt="chevron-right"
                className="w-5 h-5 cursor-pointer"
                src="/arrow/chevron-right.svg"
                onClick={() => {
                  openModal(MODAL_IDS.BATCH_TRANSACTIONS);
                }}
              />
            </div>
          </div>

          {/* Transaction Type Row */}
          <div className="bg-[#292929] rounded-lg p-2 flex justify-between items-center">
            <span className="text-[#989898] text-sm font-normal">Transaction Type</span>
            <div className="flex items-center justify-center gap-2">
              {transactionTypes.map(type => (
                <div key={type} className="bg-[#3d3d3d] px-4 rounded-md  -mt-0.5">
                  <span className="text-white text-sm font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellable in Row */}
          <div className="bg-[#292929] rounded-lg p-2 flex justify-between items-center">
            <span className="text-[#989898] text-sm font-normal">Cancellable in</span>
            <div className="flex items-center justify-center gap-2">
              {cancellableTimes.map(time => (
                <div key={time} className="bg-[#3d3d3d] px-4 rounded-md -mt-0.5">
                  <span className="text-white text-sm font-medium">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-2 w-full">
            <ActionButton text="Cancel" type="neutral" onClick={onClose} className="flex-1" />
            <ActionButton
              text="Confirm and Send"
              className="flex-3"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              // disabled={transactions.length === 0}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default BatchTransactionOverviewModal;
