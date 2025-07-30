"use client";
import React, { useEffect, useState } from "react";
import { BatchTransactionOverviewModalProps, MODAL_IDS, TransactionOverviewModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { formatAddress } from "@/services/utils/miden/address";

export function BatchTransactionOverviewModal({
  isOpen,
  onClose,
  ...props
}: ModalProp<BatchTransactionOverviewModalProps>) {
  const { sender, transactions, onConfirm } = props;
  const { openModal } = useModal();
  if (!isOpen) return null;

  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);

  useEffect(() => {
    // filter out the types of transaction
    // const types = transactions.map(transaction => transaction.noteType);
    // // unique the types
    // const uniqueTypes = [...new Set(types)];
    // setTransactionTypes(uniqueTypes);
  }, [transactions]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Transaction Overview" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-2 bg-[#1E1E1E] rounded-b-2xl w-[520px]">
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
            <div className="flex items-center gap-2">
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">6 transactions</span>
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
            <div className="flex gap-2">
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">Private</span>
              </div>
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">Public</span>
              </div>
            </div>
          </div>

          {/* Cancellable in Row */}
          <div className="bg-[#292929] rounded-lg p-2 flex justify-between items-center">
            <span className="text-[#989898] text-sm font-normal">Cancellable in</span>
            <div className="flex gap-2">
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">1 hour</span>
              </div>
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">12 hours</span>
              </div>
              <div className="bg-[#3d3d3d] px-4 py-1 rounded-md">
                <span className="text-white text-sm font-medium">24 hours</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <ActionButton text="Cancel" type="neutral" onClick={onClose} className="flex-1" />
            <ActionButton
              text="Confirm and Send"
              className="flex-3"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default BatchTransactionOverviewModal;
