"use client";
import React, { useEffect } from "react";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, SetupSchedulePaymentModalProps } from "@/types/modal";
import { useForm } from "react-hook-form";
import { ActionButton } from "@/components/Common/ActionButton";
import { SchedulePaymentFrequency } from "@/types/schedule-payment";

type FormValues = {
  frequency: SchedulePaymentFrequency;
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

const getUnitLabel = (frequency: SchedulePaymentFrequency) => {
  switch (frequency) {
    case SchedulePaymentFrequency.MONTHLY:
      return "month(s)";
    case SchedulePaymentFrequency.WEEKLY:
      return "week(s)";
    case SchedulePaymentFrequency.DAILY:
      return "day(s)";
  }
};

export function SetupSchedulePaymentModal({
  isOpen,
  onClose,
  zIndex,
  onSave,
  schedulePayment,
}: ModalProp<SetupSchedulePaymentModalProps>) {
  // **************** Custom Hooks *******************
  const { openModal } = useModal();

  /****** REACT HOOK FORM ******/
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const frequency = watch("frequency");
  const startDate = watch("startDate");
  const times = watch("times");

  useEffect(() => {
    if (schedulePayment?.times === undefined) {
      reset();
      setValue("frequency", SchedulePaymentFrequency.DAILY);
    } else {
      setValue("frequency", schedulePayment?.frequency);
      setValue("times", schedulePayment?.times);
      setValue("startDate", schedulePayment?.startDate);
    }
  }, [schedulePayment]);

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
        <form className="flex flex-col gap-3 p-1.5 bg-[#1E1E1E] rounded-b-2xl w-[550px] max-md:w-[90%]">
          {/* Frequency chips */}
          <div className="flex flex-row gap-1.5 overflow-x-auto">
            {[
              { id: SchedulePaymentFrequency.DAILY, label: "Daily Execution" },
              { id: SchedulePaymentFrequency.WEEKLY, label: "Weekly Execution" },
              { id: SchedulePaymentFrequency.MONTHLY, label: "Monthly Execution" },
            ].map(opt => {
              const isActive = frequency === (opt.id as SchedulePaymentFrequency);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setValue("frequency", opt.id as SchedulePaymentFrequency, { shouldValidate: true })}
                  className={`px-4 py-[9px] rounded-[20px] whitespace-nowrap transition-colors duration-300 ease-in-out cursor-pointer ${
                    isActive ? "bg-[#066eff] text-white" : "bg-[#313131] text-white "
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
          <ActionButton
            onClick={handleSubmit(values => {
              onSave?.(values);
              onClose();
            })}
            type="accept"
            text="Save Changes"
            className="h-9"
            disabled={!times || !startDate}
          />
        </form>
      </div>
    </div>
  );
}

export default SetupSchedulePaymentModal;
