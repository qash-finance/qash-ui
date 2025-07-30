"use client";
import React from "react";
import { MODAL_IDS, SelectTokenModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "../Common/ActionButton";

export function BatchTransactionOverviewModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const { openModal } = useModal();
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Batch Transaction Overview" icon="/modal/coin-icon.gif">
      <div className="bg-[#1e1e1e] rounded-b-[14px] p-2">
        <div className="space-y-2">
          {/* Account Row */}
          <div className="bg-[#292929] rounded-lg p-2 flex justify-between items-center">
            <span className="text-[#989898] text-sm font-normal">Account</span>
            <span className="text-white text-sm font-medium">(Jesie02) 0xBB...24y8</span>
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

          {/* Message Row */}
          <div className="bg-[#292929] rounded-lg p-2">
            <div className="space-y-2">
              <span className="text-[#989898] text-sm font-normal block">Message</span>
              <p className="text-white text-sm font-medium leading-5">
                Hello, remember me? I lend you 12,000 few months ago. Can you send me back?
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <ActionButton text="Cancel" type="neutral" onClick={onClose} className="flex-1" />
          <ActionButton text="Confirm and Send" className="flex-3" onClick={() => {}} />
        </div>
      </div>
    </BaseModal>
  );
}

export default BatchTransactionOverviewModal;
