"use client";
import React, { useState } from "react";
import { GroupLinkModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";

export function GroupLinkModal({ isOpen, onClose, zIndex, link }: ModalProp<GroupLinkModalProps>) {
  const [copied, setCopied] = useState(false);
  const groupLink = `${process.env.NEXT_PUBLIC_APP_URL}/quick-send?quickShareCode=${link}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Group link" icon="/modal/group-link-icon.svg" zIndex={zIndex}>
      <div className="bg-[#1e1e1e] rounded-b-[14px] w-[520px]">
        {/* Main Content */}
        <div className="px-2 pt-1 pb-0">
          <div className="bg-[#292929] rounded-lg p-0 py-3 h-[280px] flex flex-col items-center justify-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/modal/3d-cube-background.svg" alt="" className="w-full h-full" />
            </div>

            {/* 3D Cube Image */}
            <div className="relative z-10">
              <div
                className="w-[151px] h-[148px] bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url('/modal/3d-cube.svg')` }}
              />
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
          <div className="bg-[#3d3d3d] rounded-xl p-5 flex items-center gap-[5px] relative">
            {/* Inner shadow */}
            <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[0px_6px_4px_0px_inset_rgba(65,65,65,0.25),0px_-5px_4px_0px_inset_rgba(0,0,0,0.55)]" />

            {/* Link text */}
            <div className="flex-1 min-w-0">
              <p className="font-['Barlow'] font-medium text-[14px] text-[#edf8ff] leading-[1.25] truncate">
                {groupLink}
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyLink}
              className="bg-[#1e8fff] rounded-[10px] px-[15px] py-3 h-[33px] flex items-center gap-1.5 shadow-[0px_0px_0px_1px_#0059ff,0px_1px_3px_0px_rgba(9,65,143,0.2)] relative hover:bg-[#0d7ae8] transition-colors"
            >
              {/* Inner shadow for button */}
              <div className="absolute inset-0 pointer-events-none rounded-[10px] shadow-[0px_-2.4px_0px_0px_inset_#0059ff]" />

              <span className="font-['Barlow'] font-medium text-[16px] text-white leading-none tracking-[-0.084px] relative z-10">
                {copied ? "Copied!" : "Copy Link"}
              </span>
              <div className="w-5 h-5 flex items-center justify-center relative z-10">
                <img
                  src="/copy-icon.svg"
                  alt="Copy"
                  className="w-full h-full"
                  style={{
                    filter: "invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default GroupLinkModal;
