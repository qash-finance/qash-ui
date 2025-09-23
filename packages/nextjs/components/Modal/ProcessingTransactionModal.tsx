"use client";
import React from "react";
import { ProcessingTransactionModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";

export function ProcessingTransactionModal({ isOpen, onClose, zIndex }: ModalProp<ProcessingTransactionModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-background rounded-2xl w-[350px] flex flex-col items-center justify-center px-2 py-10 gap-2">
        <img src="/modal/sending.gif" alt="loading" className="w-20" />
        <span className="text-text-primary text-xl">Processing your transfer</span>
        <span className="text-text-secondary">Just a moment, we’re sending your crypto…</span>
      </div>
    </BaseModal>
  );
}

export default ProcessingTransactionModal;
