"use client";
import React from "react";
import { PayrollPreviewModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "@/components/Common/ModalHeader";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";

const BasicInformation = () => {
  return (
    <div className="flex flex-col gap-5 p-3 border border-primary-divider rounded-xl">
      <span className="text-text-primary text-xl font-semibold">Basic Information</span>

      {/* Payroll name */}
      <div className="flex flex-col gap-1">
        <span className="text-text-secondary text-sm leading-none">Payroll name</span>
        <span className="text-text-primary font-semibold leading-none">Payroll name</span>
      </div>

      {/* Assignee */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-sm leading-none">Assignee</span>
        <div className="flex flex-row gap-2 items-center">
          <div className="w-6 h-6 rounded-full bg-primary-divider flex items-center justify-center">
            <img src="/misc/user-hexagon-icon.svg" alt="Assignee" className="w-5 h-5" />
          </div>
          <span className="text-text-primary font-semibold leading-none">Assignee</span>
          <span className="text-text-secondary leading-none">0x097...0fdb7</span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-sm leading-none">Description</span>
        <span className="text-text-primary  leading-none">
          This payroll system is designed to streamline the payment process for employees, ensuring timely and accurate
          salary disbursements
        </span>
      </div>
    </div>
  );
};

const FixedAmount = () => {
  return (
    <div className="flex flex-col gap-5 p-3 border border-primary-divider rounded-xl">
      <span className="text-text-primary text-xl font-semibold">Fixed Amount</span>

      {/* Payroll name */}
      <div className="flex flex-col gap-1">
        <span className="text-text-secondary text-sm leading-none">Contract term</span>
        <div className="flex flex-row gap-2 items-center">
          <span className="text-primary-blue font-semibold leading-none">5 months</span>
          <span className="text-text-secondary text-sm leading-none">(14/07/2025 - 14/10/2025)</span>
        </div>
      </div>

      {/* Assignee */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-sm leading-none">Token Amount</span>
        <span className="text-primary-blue font-semibold leading-none">5,000 USDT/5 months</span>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-sm leading-none">Description</span>
        <span className="text-text-primary  leading-none">
          This payroll system is designed to streamline the payment process for employees, ensuring timely and accurate
          salary disbursements
        </span>
      </div>
    </div>
  );
};

const BonusAmount = () => {
  return (
    <div className="flex flex-col gap-5 p-3 border border-primary-divider rounded-xl min-h-[180px] max-h-[360px] overflow-y-auto">
      <span className="text-text-primary text-xl font-semibold">Bonus Amount</span>

      {/* Payroll name */}
      <div className="flex flex-row justify-between">
        <span className="text-text-secondary text-sm leading-none">1st month</span>
        <span className="text-primary-blue font-semibold leading-none">5,000 USDT</span>
      </div>

      {/* Assignee */}
      <div className="flex flex-row justify-between">
        <span className="text-text-secondary text-sm leading-none">2nd month</span>
        <span className="text-primary-blue font-semibold leading-none">5,000 USDT/5 months</span>
      </div>

      {/* Description */}
      <div className="flex flex-row justify-between">
        <span className="text-text-secondary text-sm leading-none">3rd month</span>
        <span className="text-primary-blue font-semibold leading-none">5,000 USDT</span>
      </div>
    </div>
  );
};

const MilestoneItem = () => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-secondary text-sm leading-none">Milestone 1</span>
      <div className="flex flex-row gap-2 items-center">
        <span className="text-text-primary leading-none">Payroll</span>
        <span className="text-text-secondary text-sm leading-none">(Due date: 10/09/2025 · 12:00 AM)</span>
      </div>
      <span className="text-primary-blue font-semibold leading-none">5,000 USDT</span>
      <span className="text-text-primary leading-none">Complete this feature to get $1000</span>
    </div>
  );
};

const Milestone = () => {
  return (
    <div className="flex flex-col gap-5 p-3 border border-primary-divider rounded-xl min-h-[180px] max-h-[360px] overflow-y-auto">
      <span className="text-text-primary text-xl font-semibold">Milestone</span>

      <div className="border-b border-primary-divider h-[1px]" />

      <MilestoneItem />
      <MilestoneItem />
    </div>
  );
};

export function PayrollPreviewModal({ isOpen, onClose, zIndex }: ModalProp<PayrollPreviewModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Payroll Preview" onClose={onClose} icon="/misc/blue-eye-icon.svg" />
      <div className="bg-background rounded-b-2xl w-[600px] p-4 border-2 border-primary-divider max-h-[800px] overflow-y-auto gap-2 flex flex-col">
        <BasicInformation />
        <FixedAmount />
        <BonusAmount />
        <Milestone />

        <div className="flex flex-row justify-between p-1 py-3">
          <span className="text-text-secondary text-sm leading-none">Total locked amount </span>
          <div className="flex flex-row gap-2 items-center">
            <img src="/token/qash.svg" alt="QASH" className="w-5 h-5" />
            <span className="text-text-primary text-2xl font-semibold leading-none">5,000 USDT</span>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <SecondaryButton text="Cancel" onClick={onClose} variant="light" />
          <PrimaryButton text="Confirm" onClick={onClose} />
        </div>
      </div>
    </BaseModal>
  );
}

export default PayrollPreviewModal;
