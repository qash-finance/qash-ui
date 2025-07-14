"use client";
import React from "react";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import SendTransactionForm from "../Send/SendTransactionForm";

export function SendModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <SendTransactionForm />
    </div>
  );
}

export default SendModal;
