"use client";
import React from "react";
import { SendModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import SendTransactionForm from "../Send/SendTransactionForm";
import BaseModal from "./BaseModal";

export function SendModal({ isOpen, onClose, ...props }: ModalProp<SendModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Send transaction" icon="/modal/coin-icon.gif">
      <SendTransactionForm {...props} onClose={onClose} />
    </BaseModal>
  );
}

export default SendModal;
