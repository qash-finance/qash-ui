"use client";
import React, { useState, useEffect } from "react";
import { BonusAmountModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "@/components/Common/ModalHeader";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";

const inputContainerClass = "bg-app-background rounded-xl p-3 border-b-2 border-primary-divider";
const labelClass = "text-text-secondary text-sm";

export function BonusAmountModal({
  isOpen,
  onClose,
  zIndex,
  monthlyBonusAmounts,
  onUpdateAmounts,
  numberOfMonths,
  selectedTokenSymbol,
}: ModalProp<BonusAmountModalProps>) {
  const [localAmounts, setLocalAmounts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setLocalAmounts(monthlyBonusAmounts);
    }
  }, [isOpen, monthlyBonusAmounts]);

  const handleAmountChange = (monthKey: string, value: string) => {
    setLocalAmounts(prev => ({
      ...prev,
      [monthKey]: value,
    }));
  };

  const handleConfirm = () => {
    onUpdateAmounts(localAmounts);
    onClose();
  };

  const handleCancel = () => {
    setLocalAmounts(monthlyBonusAmounts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Monthly bonus amounts" onClose={onClose} />
      <div className="bg-background rounded-b-2xl w-[580px] p-4 border-2 border-primary-divider max-h-[620px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <span className="text-text-primary text-2xl font-semibold">
            You can adjust the bonus amount for each month
          </span>
          <div className="flex flex-row items-center gap-2 justify-end">
            <CustomCheckbox checked={false} onChange={() => {}} className="text-text-primary" />
            <span className="text-text-primary text-sm">Apply to all</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
            {Array.from({ length: numberOfMonths }, (_, index) => {
              const monthNumber = index + 1;
              const monthKey = `month_${monthNumber}`;
              const monthValue = localAmounts[monthKey] || "";

              return (
                <div key={monthKey} className={`${inputContainerClass} flex items-center justify-between`}>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <p className={labelClass}>
                      {monthNumber === 1
                        ? "1st"
                        : monthNumber === 2
                          ? "2nd"
                          : monthNumber === 3
                            ? "3rd"
                            : `${monthNumber}th`}{" "}
                      month
                    </p>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="0.00"
                      value={monthValue}
                      onChange={e => handleAmountChange(monthKey, e.target.value)}
                      className="outline-none bg- text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <span className="text-text-primary">{selectedTokenSymbol}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-row gap-2 w-full items-center pt-4">
            <SecondaryButton text="Cancel" onClick={handleCancel} variant="light" />
            <PrimaryButton text="Confirm" onClick={handleConfirm} />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default BonusAmountModal;
