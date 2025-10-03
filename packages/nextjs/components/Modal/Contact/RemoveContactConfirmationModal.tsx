"use client";
import React from "react";
import { RemoveContactConfirmationModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { formatAddress } from "@/services/utils/miden/address";

export function RemoveContactConfirmationModal({
  isOpen,
  onClose,
  zIndex,
  onRemove,
  contactName,
  contactAddress,
}: ModalProp<RemoveContactConfirmationModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-background rounded-2xl w-[380px] gap-10 flex flex-col justify-center items-center p-4 pt-8">
        {contactName && contactAddress ? (
          <span className="text-text-primary font-bold text-xl text-center w-[280px]">
            Are you sure you want to remove this {contactName} ({formatAddress(contactAddress)})?
          </span>
        ) : (
          <span className="text-text-primary font-bold text-xl text-center w-[280px]">
            Are you sure you want to remove these addresses?
          </span>
        )}
        <div className="flex gap-2 w-full">
          <SecondaryButton text="Cancel" variant="light" onClick={onClose} />
          <SecondaryButton
            text="Remove"
            variant="red"
            onClick={() => {
              onRemove?.();
              onClose();
            }}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export default RemoveContactConfirmationModal;
