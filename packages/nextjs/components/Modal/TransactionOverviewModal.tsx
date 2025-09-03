"use client";
import React from "react";
import { TransactionOverviewModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { formatAddress } from "@/services/utils/miden/address";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { ScheduleTransactionDropdown } from "../SchedulePayment/ScheduleTransactionDropdown";

export function TransactionOverviewModal({ isOpen, onClose, ...props }: ModalProp<TransactionOverviewModalProps>) {
  const {
    amount,
    accountName,
    accountAddress,
    recipientName,
    recipientAddress,
    transactionType,
    cancellableTime,
    message,
    onConfirm,
    tokenAddress,
    tokenSymbol,
    schedulePayment,
  } = props;

  const isSchedulePayment = schedulePayment?.times !== undefined;

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Transaction Overview" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-2 bg-[#1E1E1E] rounded-b-2xl w-[550px]">
        {/* Amount Section */}
        <div className="bg-[#292929] flex flex-col h-[180px] items-center justify-center py-3 rounded-lg w-full">
          <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Total Amount</div>
          <div className="flex items-center gap-2">
            <div className="text-white text-[40px] font-medium tracking-[0.2px] leading-[normal]">
              {isSchedulePayment ? (parseFloat(amount || "0") * schedulePayment.times).toString() : amount}
            </div>
            <img
              alt={tokenSymbol || "Token"}
              className="w-8 h-8"
              src={tokenAddress === QASH_TOKEN_ADDRESS ? "/token/qash.svg" : blo(turnBechToHex(tokenAddress || ""))}
            />
          </div>
        </div>

        {/* Transaction Details */}
        <div className="flex flex-col gap-1 w-full">
          {/* Account Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Account</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">
              {accountName && `(${accountName})`} {accountAddress && formatAddress(accountAddress)}
            </div>
          </div>

          {/* Recipient Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Recipent</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">
              {recipientName && `(${recipientName})`} {recipientAddress && formatAddress(recipientAddress)}
            </div>
          </div>

          {/* Schedule Payment Row */}
          {isSchedulePayment && (
            <ScheduleTransactionDropdown schedulePayment={schedulePayment} amount={amount} tokenSymbol={tokenSymbol} />
          )}

          {/* Transaction Type Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Transaction Type</div>
            <div className="bg-[#3d3d3d] rounded-md px-3 py-1.5 w-fit">
              <span className="text-white text-[14px] leading-3 tracking-[0.07px] truncate block text-center">
                {transactionType}
              </span>
            </div>
          </div>

          {/* Cancellable in Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Cancellable in</div>
            <div className="bg-[#3d3d3d] rounded-md px-3 py-1.5 w-fit">
              <span className="text-white text-[14px] leading-3 tracking-[0.07px] truncate block text-center">
                {cancellableTime}
              </span>
            </div>
          </div>

          <div className="mt-3 flex gap-2 w-full">
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

export default TransactionOverviewModal;
