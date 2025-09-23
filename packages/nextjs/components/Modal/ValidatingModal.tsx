"use client";
import React from "react";
import { ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";

export function ValidatingModal({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-[#1E1E1E] rounded-b-xl">
        <div className="flex flex-col gap-2.5 items-start justify-start pb-2 pt-1 px-2">
          <div className="bg-[#292929] flex flex-col gap-8 h-[280px] items-center justify-center py-3 rounded-lg w-full">
            <img src="/modal/loading-dot.gif" alt="loading" className="scale-100" />
            <div className="flex flex-col gap-2 items-center justify-start w-[334px]">
              <div className="font-['Barlow:Medium',_sans-serif] text-[#ffffff] text-[24px] tracking-[0.12px]">
                <p className="adjustLetterSpacing leading-[20px]">Validating...</p>
              </div>
              <div className="font-['Barlow:Regular',_sans-serif] text-[#989898] text-[16px] text-center tracking-[0.08px]">
                <p className="leading-[20px]">We're confirming details on the blockchain.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default ValidatingModal;
