"use client";
import React from "react";
import { GroupLinkModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "../../Common/ActionButton";
import { toast } from "react-hot-toast";

export function GroupLinkModal({ isOpen, onClose, zIndex, link }: ModalProp<GroupLinkModalProps>) {
  const groupLink = `${process.env.NEXT_PUBLIC_APP_URL}/quick-send?quickShareCode=${link}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(groupLink);
    toast.success("Link copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Group link" icon="/modal/group-link-icon.svg" zIndex={zIndex}>
      <div className="bg-[#1e1e1e] rounded-b-[14px] w-[520px]">
        {/* Main Content */}
        <div className="px-2 pt-1 pb-0">
          <div className="bg-[#292929] rounded-lg p-0 py-3 h-[280px] flex flex-col items-center justify-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-start justify-center top-5">
              <img src="/modal/3d-cube-background.svg" alt="" className="scale-150" />
            </div>

            {/* 3D Cube Image */}
            <div className="relative z-10">
              <img src="/modal/3d-cube.svg" alt="" className="scale-80" />
            </div>

            {/* Success Message */}
            <div className="flex flex-col items-center gap-2 w-[334px] text-center relative z-10">
              <h3 className="font-['Barlow'] font-medium text-[24px] text-white leading-[20px] tracking-[0.12px]">
                Link created successfully
              </h3>
              <p className="font-['Barlow'] font-normal text-[14px] text-[#989898] leading-[20px] tracking-[0.07px]">
                Your group payment link is ready. Share it with others to start collecting payments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button Container */}
        <div className="p-2">
          <div className="bg-white rounded-xl p-3 flex items-center  relative">
            {/* Link text */}
            <div className="flex-1 min-w-0">
              <p className="font-['Barlow'] font-medium text-[14px] text-[#066EFF] leading-[1.25] truncate">
                {groupLink}
              </p>
            </div>

            {/* Copy Button */}
            <ActionButton text="Copy link" onClick={handleCopyLink} icon="/copy-icon.svg" iconPosition="right" />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default GroupLinkModal;
