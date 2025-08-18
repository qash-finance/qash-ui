"use client";
import React from "react";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, SetupSchedulePaymentModalProps, ScheduleFrequency } from "@/types/modal";
import BaseModal from "../BaseModal";
import { useForm } from "react-hook-form";
import { ModalHeader } from "../../Common/ModalHeader";
import { useAccountContext } from "@/contexts/AccountProvider";

type FormValues = {
  frequency: ScheduleFrequency;
  times: number;
  startDate?: Date;
};

/***** UTILS ******/
function formatDateDDMMYYYY(date?: Date) {
  if (!date) return "DD/MM/YYYY";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const getUnitLabel = (frequency: ScheduleFrequency) => {
  switch (frequency) {
    case "monthly":
      return "months";
    case "weekly":
      return "weeks";
    case "daily":
      return "days";
  }
};

export function SetupSchedulePaymentModal({
  isOpen,
  onClose,
  zIndex,
  initialFrequency = "monthly",
  initialTimes = 1,
  initialStartDate,
  onSave,
}: ModalProp<SetupSchedulePaymentModalProps>) {
  // **************** Custom Hooks *******************
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { openModal } = useModal();

  /****** REACT HOOK FORM ******/
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      frequency: initialFrequency,
      times: initialTimes,
      startDate: initialStartDate,
    },
  });
  const frequency = watch("frequency");
  const startDate = watch("startDate");
  const times = watch("times");

  if (!isOpen) return null;

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-0">
        {/* Header */}
        <header className="flex justify-between items-center self-stretch pt-2.5 pr-2.5 pb-2 pl-4 border-b border-solid bg-zinc-800 rounded-t-2xl border-b-neutral-900 max-sm:py-2 max-sm:pr-2 max-sm:pl-3">
          <div className="flex gap-1.5 items-center">
            <div className="flex justify-center items-center p-0.5 w-5 h-5 rounded-md bg-neutral-900 cursor-pointer">
              <img src="/modal/coin-icon.gif" alt="" className="shrink-0 w-4 h-4 grayscale" />
            </div>
            <h1 className="text-base font-medium tracking-tight leading-4 text-white max-md:text-base max-sm:text-sm">
              Transfer setup information
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div
              className="flex items-end gap-2 bg-white rounded-lg px-2 py-1 cursor-pointer"
              onClick={() => openModal(MODAL_IDS.RECURRING_TRANSFER)}
            >
              <img src="/modal/calendar.svg" alt="schedule" className="w-5 h-5" />
              <span className="text-[13px] font-medium text-[#066eff] leading-5">Recurring Transfer List</span>
            </div>
            <img
              src="/dark-close-icon.svg"
              alt="dark-close-icon"
              className="w-6 h-6 cursor-pointer"
              onClick={onClose}
            />
          </div>
        </header>

        {/* Form */}
        <form
          className="flex flex-col gap-3 p-1.5 bg-[#1E1E1E] rounded-b-2xl w-[550px] max-md:w-[90%]"
          onSubmit={handleSubmit(values => {
            onSave?.(values);
            onClose();
          })}
        >
          {/* Frequency chips */}
          <div className="flex flex-row gap-1.5 overflow-x-auto">
            {[
              { id: "daily", label: "Daily Execution" },
              { id: "weekly", label: "Weekly Execution" },
              { id: "monthly", label: "Monthly Execution" },
            ].map(opt => {
              const isActive = frequency === (opt.id as ScheduleFrequency);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setValue("frequency", opt.id as ScheduleFrequency, { shouldValidate: true })}
                  className={`px-4 py-[9px] rounded-[20px] whitespace-nowrap transition-colors duration-300 ease-in-out ${
                    isActive ? "bg-[#066eff] text-white" : "bg-[#313131] text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Times */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] text-white">Times</span>
            <div className="bg-[#292929] rounded-xl px-1">
              <div className="flex items-center justify-between px-3.5 py-3 rounded-lg">
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-label="Times"
                  placeholder="Enter number"
                  {...register("times", {
                    valueAsNumber: true,
                    required: "Times is required",
                    min: { value: 1, message: "Minimum is 1" },
                  })}
                  className="bg-transparent outline-none text-[16px] tracking-[-0.32px] text-white placeholder:text-[#656565] w-full"
                />
                <span className="text-[16px] tracking-[-0.32px] text-white transition-colors duration-300 ease-in-out">
                  {getUnitLabel(frequency)}
                </span>
              </div>
            </div>
            {errors.times && <span className="text-sm text-red-500">{errors.times.message}</span>}
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] text-white">Start date</span>
            <div
              className="bg-[#292929] rounded-xl h-[43px] px-1 cursor-pointer"
              onClick={() =>
                openModal(MODAL_IDS.DATE_PICKER, {
                  defaultSelected: startDate,
                  onSelect: (d: Date | undefined) => setValue("startDate", d, { shouldValidate: true }),
                })
              }
            >
              <div className="flex items-center justify-between h-[43px] pl-3.5 pr-0 py-3 rounded-lg">
                <span className="text-[16px] tracking-[-0.32px] text-white/80 transition-colors duration-300 ease-in-out">
                  {formatDateDDMMYYYY(startDate)}
                </span>
                <button
                  type="button"
                  className="bg-[#3d3d3d] rounded-md p-[6px] flex items-center justify-center cursor-pointer"
                >
                  <img src="/modal/calendar-icon.svg" alt="calendar" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-xl text-white text-[16px] tracking-[-0.084px] bg-[#7c7c7c] p-3 cursor-pointer "
            style={{
              boxShadow:
                "0px 0px 0px 1px #525252, 0px 1px 3px 0px rgba(78,78,78,0.2), 0px -2.4px 0px 0px #525252 inset",
            }}
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupSchedulePaymentModal;
