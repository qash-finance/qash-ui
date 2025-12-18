"use client";
import React from "react";
import { RemoveInvoiceModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { SecondaryButton } from "@/components/Common/SecondaryButton";

export function RemoveInvoiceModal({
  isOpen,
  onClose,
  zIndex,
  invoiceOwnerName,
  onRemove,
}: ModalProp<RemoveInvoiceModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-background flex  w-[450px] flex-col rounded-2xl">
        <div className=" rounded-t-2xl flex justify-center items-center border-b-1 border-primary-divider">
          <div className="relative flex justify-start items-center w-full text-center py-6 px-5">
            <span className="text-text-primary font-bold text-left">Delete invoice</span>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 right-6 w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer"
              onClick={onClose}
            >
              <img src="/misc/close-icon.svg" alt="close icon" />
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-b-2xl justify-center items-center py-5 px-3 gap-7 ">
          <span className="text-lg text-center text-text-primary px-5 font-bold">
            Are you sure you want to delete <span className="text-primary-blue">{invoiceOwnerName}</span> invoice?
          </span>
          <div className="flex w-full flex-row gap-3">
            <SecondaryButton onClick={onClose} buttonClassName="flex-1" variant="light" text="Cancel" />
            <SecondaryButton
              onClick={() => {
                onRemove();
                onClose();
              }}
              buttonClassName="flex-1"
              variant="red"
              text="Delete"
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default RemoveInvoiceModal;
