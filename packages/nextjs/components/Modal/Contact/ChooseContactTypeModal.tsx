"use client";
import React from "react";
import { ChooseContactTypeModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";

const ContactCard = ({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex flex-col gap-3 items-start justify-end p-5 border border-primary-divider w-full rounded-lg h-[180px] cursor-pointer"
      onClick={onClick}
    >
      <img src={icon} alt="contact icon" />
      <div className="flex flex-col gap-1">
        <span className="text-text-primary font-bold">{title}</span>
        <span className="text-text-secondary text-xs">{subtitle}</span>
      </div>
    </div>
  );
};

export function ChooseContactTypeModal({ isOpen, onClose, zIndex }: ModalProp<ChooseContactTypeModalProps>) {
  const { openModal } = useModal();
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-background flex  w-[620px] flex-col rounded-2xl">
        <div className=" rounded-t-2xl flex justify-center items-center border-b-1 border-primary-divider">
          <div className="relative flex justify-start items-center w-full text-center py-6 px-5">
            <span className="text-text-primary font-bold text-left">Choose type</span>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 right-6 w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer"
              onClick={onClose}
            >
              <img src="/misc/close-icon.svg" alt="close icon" />
            </div>
          </div>
        </div>
        <div className="flex flex-row rounded-b-2xl justify-between items-center p-5 gap-2">
          <ContactCard
            icon="/misc/orange-employee-icon.svg"
            title="Employee"
            subtitle="Add your company's employees to manage their payroll details and payments."
            onClick={() => {
              openModal("CREATE_EMPLOYEE_CONTACT");
            }}
          />
          <ContactCard
            icon="/misc/blue-client-icon.svg"
            title="Client"
            subtitle="Add your clients so you can easily send invoices and track payments"
            onClick={() => {
              openModal("CREATE_CLIENT_CONTACT");
            }}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export default ChooseContactTypeModal;
