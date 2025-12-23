"use client";
import React from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

export const Header = () => {
  const { openModal } = useModal();
  return (
    <div className="flex flex-row items-center justify-between w-full">
      <div className="flex flex-row items-center justify-center gap-3">
        <img src="/sidebar/contact-book.svg" alt="Qash" className="w-6 h-6" />
        <span className="text-2xl font-bold">Contact</span>
      </div>
      <div className="flex flex-row items-center justify-center gap-3">
        <PrimaryButton
          text="Add contact"
          icon="/misc/plus-icon.svg"
          iconPosition="left"
          onClick={() => openModal(MODAL_IDS.CHOOSE_CONTACT_TYPE)}
          containerClassName="w-[140px]"
        />
      </div>
    </div>
  );
};
