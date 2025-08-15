"use client";
import React from "react";
import { GiftSharingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";

export function GiftSharingModal({ isOpen, onClose, ...props }: ModalProp<GiftSharingModalProps>) {
  const { giftLink } = props;

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Gift Transaction Overview" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-2 bg-[#1E1E1E] rounded-b-2xl w-[520px]">
        {/* Transaction Details */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl text-white text-center">Share your friend the surprise gift!</span>
            <p className="text-sm text-neutral-500">
              Send a gift to your friend and watch them open it with excitement.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <img src="/gift/open-gift/gift-created.svg" alt="" draggable={false} />
          </div>
          {/* Transaction Type Row */}
          <div className="bg-[#292929] flex items-center justify-between px-3 py-2.5 rounded-lg w-full">
            <div className="text-[#989898] text-[14px] tracking-[0.07px] leading-[20px]">Gift Link</div>
            <div className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">{giftLink}</div>
          </div>

          <div className="mt-3 flex gap-2 w-full">
            <button
              className={`flex items-center gap-1.5 justify-center px-2 py-1.5 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${"bg-blue-600"}`}
              onClick={async () => {
                await navigator.clipboard.writeText(giftLink);
                toast.success("Link copied to clipboard");
              }}
            >
              <span className={`text-sm font-medium tracking-tight leading-4 text-white`}>Copy link</span>
              <img
                src="/copy-icon.svg"
                alt="copy"
                className="w-4 h-4"
                style={{ filter: "invert(1) brightness(1000%)" }}
                draggable={false}
              />
            </button>
            <ActionButton
              text="Copy Link"
              className="flex-3"
              onClick={async () => {
                await navigator.clipboard.writeText(giftLink);
                toast.success("Link copied to clipboard");
              }}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default GiftSharingModal;
