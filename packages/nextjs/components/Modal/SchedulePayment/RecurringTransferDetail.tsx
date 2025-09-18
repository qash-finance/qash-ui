"use client";
import React from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { RecurringTransferDetailProps } from "@/types/modal";
import { ScheduleTransactionRow } from "@/components/SchedulePayment/ScheduleTransactionDropdown";
import { ScheduleTransactionDropdown } from "@/components/SchedulePayment/ScheduleTransactionDropdown";

const rowContainerClass = "flex items-center justify-between bg-[#292929] rounded-lg py-2.5 pl-3 pr-[15px]";

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className={rowContainerClass}>
    <span className="text-[#989898] text-[14px] leading-5 tracking-[0.07px]">{label}</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);
/**
 * 
 *{
    "recipientName": "mtst1q...yzuv",
    "amount": "1",
    "token": {
        "faucetId": "mtst1qpuzxzy5au9n2gq5vhsvyyl9jsaq5a7w",
        "amount": "1",
        "metadata": {
            "symbol": "QASH",
            "decimals": 8,
            "maxSupply": 1000000000000000000
        }
    },
    "frequencyLabel": "Daily",
    "startDateLabel": "From 26/08/2025",
    "timesLabel": "0/3 times"
}
 */

export function RecurringTransferDetail({
  isOpen,
  onClose,
  zIndex,
  item,
  transactions,
}: ModalProp<RecurringTransferDetailProps>) {
  if (!isOpen) return null;

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
        <div className="flex flex-col gap-1.5 bg-[#292929] rounded-xl pb-2 w-[550px] max-md:w-[90%] mt-1.5">
          {/* Title */}
          <div className="flex items-center px-4 h-[40px]">
            <span className="text-white text-[16px] tracking-[-0.32px]">Recurring Transfer Detail</span>
          </div>

          {/* Card */}
          <div className="flex flex-col gap-3 bg-[#0c0c0c] rounded-lg p-2 mx-1.5">
            {/* Recipient row */}
            <div className="flex items-center gap-4 px-1">
              <div
                className="w-16 h-16 bg-no-repeat bg-center"
                style={{
                  backgroundImage: "url('/modal/calendar.svg')",
                  backgroundSize: "92% 92%",
                  backgroundPosition: "28% 66%",
                }}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[#989898] text-[14px] leading-5 tracking-[0.07px]">Recipent</span>
                <span className="text-white text-[14px] leading-5 tracking-[0.07px]">{item.recipientName}</span>
              </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col space-y-1 w-full">
              {/** Total amount */}
              <InfoRow label="Total amount">
                <span className="text-white text-[16px] leading-5 tracking-[0.08px]">{item.amount}</span>
              </InfoRow>

              {/** Type */}
              <InfoRow label="Type">
                <div className="bg-[#3d3d3d] rounded-md px-4 py-1.5">
                  <span className="text-white text-[14px] leading-5 tracking-[0.07px]">{item.frequencyLabel}</span>
                </div>
              </InfoRow>

              {/** Times */}
              <InfoRow label="Times">
                <span className="text-white text-[14px] leading-5 tracking-[0.07px]">
                  {item.timesLabel.replace(/\D/g, "")}
                </span>
              </InfoRow>

              {/** Start date */}
              <InfoRow label="Start date">
                <span className="text-white text-[14px] leading-5 tracking-[0.07px]">
                  {item.startDateLabel.replace(/^From\s+/, "")}
                </span>
              </InfoRow>

              {/* Schedule payment section */}
              <ScheduleTransactionDropdown
                schedulePayment={{
                  frequency: item.frequencyLabel.toUpperCase() as any,
                  times: parseInt(item.timesLabel.split("/")[1].split(" ")[0]),
                  startDate: new Date(
                    item.startDateLabel
                      .replace(/^From\s+/, "")
                      .split("/")
                      .reverse()
                      .join("-"),
                  ),
                }}
                amount={item.amount}
                tokenSymbol={item.token.metadata.symbol}
                defaultOpen={true}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default RecurringTransferDetail;
