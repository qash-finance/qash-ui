"use client";
import React from "react";
import { DeleteGroupModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function DeleteGroupModal({
  isOpen,
  onClose,
  zIndex,
  groupName = "",
  onDelete,
}: ModalProp<DeleteGroupModalProps>) {
  if (!isOpen) return null;

  const handleDelete = async () => {
    await onDelete?.();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Delete Group" icon="/sidebar/group-payment.gif" zIndex={zIndex}>
      <div className="flex flex-col items-start gap-2.5 p-2 pt-1 bg-[#1E1E1E] rounded-b-xl">
        <div className="bg-[#292929] h-[280px] w-[504px] rounded-lg flex flex-col items-center justify-center gap-4">
          <img alt="warning" src="/trashcan-icon.svg" className="w-16 h-16" />
          <div className="flex flex-col items-center gap-2 leading-none not-italic text-center px-[90px] w-full">
            <div className="text-[24px] tracking-[0.12px] text-white font-medium">
              <p className="leading-[26px]">
                Are you sure you want to delete <span className="text-[#1e8fff]">“{groupName}”</span> group?
              </p>
            </div>
            <div className="text-[14px] tracking-[0.07px] text-[#989898]">
              <p className="leading-5">This can’t be undone. The group and all its content will be gone.</p>
            </div>
          </div>
        </div>
        <div className=" rounded-b-xl flex gap-2 w-full">
          <ActionButton text="Cancel" type="neutral" onClick={onClose} className="flex-1" />
          <ActionButton text="Delete" type="deny" onClick={handleDelete} className="flex-2" />
        </div>
      </div>
    </BaseModal>
  );
}

export default DeleteGroupModal;
