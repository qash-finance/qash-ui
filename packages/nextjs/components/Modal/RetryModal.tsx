"use client";

import React from "react";
import { RetryModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { SecondaryButton } from "../Common/SecondaryButton";

export function RetryModal({ isOpen, onClose, zIndex, onRetry }: ModalProp<RetryModalProps>) {
  const handleReset = async () => {
    onRetry?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="flex flex-col items-center justify-center gap-5 p-3 bg-background rounded-2xl w-[500px] relative">
        <div className="flex flex-col items-center justify-center gap-2">
          <img alt="reset-warning" src="/misc/something-went-wrong.svg" className="w-50" />
          <div className="flex flex-col items-center justify-start not-italic px-10 w-full text-center">
            <span className="text-text-primary text-[24px] font-bold w-full">Oops! Something went wrong</span>
            <span className="text-text-secondary text-[14px] w-full">Please try again</span>
          </div>
        </div>
        <div
          className="w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer absolute top-5 right-5"
          onClick={onClose}
        >
          <img src="/misc/close-icon.svg" alt="close icon" />
        </div>
        <div className="rounded-b-xl flex gap-2 w-full">
          <SecondaryButton text="Cancel" variant="light" onClick={onClose} buttonClassName="flex-1" />
          <SecondaryButton text="Try again" onClick={handleReset} buttonClassName="flex-1" />
        </div>
      </div>
    </BaseModal>
  );
}

export default RetryModal;
