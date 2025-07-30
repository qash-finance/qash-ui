"use client";
import React, { useEffect, useState } from "react";
import { BatchTransactionOverviewModalProps, TransactionOverviewModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { formatAddress } from "@/services/utils/miden/address";

export function BatchTransactionOverviewModal({
  isOpen,
  onClose,
  ...props
}: ModalProp<BatchTransactionOverviewModalProps>) {
  const { sender, transactions, onConfirm } = props;

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
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Recipent</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]"></div>
          </div>

          {/* Transaction Type Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Transaction Type</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]"></div>
          </div>

          {/* Cancellable in Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Cancellable in</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]"></div>
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
