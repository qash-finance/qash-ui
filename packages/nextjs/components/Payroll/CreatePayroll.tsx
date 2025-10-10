"use client";
import React, { useState } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useForm } from "react-hook-form";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { AssetWithMetadata } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { SecondaryButton } from "../Common/SecondaryButton";
import { FixedAmount } from "./CreatePayroll/FixedAmount";
import { MilestoneSetup } from "./CreatePayroll/MilestoneSetup";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";

interface CreatePayrollFormData {
  payrollName: string;
  description: string;
  assignee: string;
  monthlyAmount: string;
  time: string;
}

interface FormInputProps {
  label: string;
  placeholder: string;
  type?: string;
  register: any;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const FormInput = ({ label, placeholder, type = "text", register, error, disabled, required }: FormInputProps) => (
  <div className="flex flex-col gap-2">
    <div className="bg-background rounded-xl border-b-2 border-primary-divider">
      <div className="flex flex-col gap-1 px-4 py-2">
        <label className="text-text-secondary text-sm font-medium">{label}</label>
        <input
          {...register}
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
          autoFocus={label === "Name"}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
    </div>
    {error && (
      <div className="flex items-center gap-1 pl-2">
        <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
        <span className="text-[#E93544] text-sm">{error}</span>
      </div>
    )}
  </div>
);

const inputContainerClass = "bg-background rounded-xl p-3 border-b-2 border-primary-divider";
const labelClass = "text-text-secondary text-sm";

const CreatePayroll = () => {
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: "",
    metadata: {
      symbol: "",
      decimals: 0,
      maxSupply: 0,
    },
  });
  const [applyToAll, setApplyToAll] = useState(false);

  const [milestoneSetup, setMilestoneSetup] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPayDay, setSelectedPayDay] = useState(1);
  const [timePeriod, setTimePeriod] = useState("AM");
  const [isFixedAmountEnabled, setIsFixedAmountEnabled] = useState(false);
  const [isMilestoneSetupEnabled, setIsMilestoneSetupEnabled] = useState(false);
  const [isBonusAmountEnabled, setIsBonusAmountEnabled] = useState(false);
  const [monthlyBonusAmounts, setMonthlyBonusAmounts] = useState<{ [key: string]: string }>({});
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreatePayrollFormData>({
    mode: "onChange",
    defaultValues: {
      time: "10:00",
      payrollName: "",
      description: "",
      assignee: "",
      monthlyAmount: "",
    },
  });

  // Calculate number of months between start and end dates
  const calculateMonthsBetween = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;

    try {
      // Parse DD/MM/YYYY format
      const [startDay, startMonth, startYear] = startDateStr.split("/").map(Number);
      const [endDay, endMonth, endYear] = endDateStr.split("/").map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      if (startDate >= endDate) return 0;

      const yearDiff = endYear - startYear;
      const monthDiff = endMonth - startMonth;

      return yearDiff * 12 + monthDiff + (endDay >= startDay ? 1 : 0);
    } catch (error) {
      console.error("Error calculating months between dates:", error);
      return 0;
    }
  };

  // const handleToggle = (type: "fixedAmount" | "bonusAmount" | "milestoneSetup") => {
  //   switch (type) {
  //     case "fixedAmount":
  //       setFixedAmount(!fixedAmount);
  //       break;
  //     case "bonusAmount":
  //       setBonusAmount(!bonusAmount);
  //       break;
  //     case "milestoneSetup":
  //       setMilestoneSetup(!milestoneSetup);
  //       break;
  //   }
  // };

  const handleCreatePayroll = () => {
    // Handle payroll creation logic
    console.log("Creating payroll...");
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_RECIPIENT, {
      onSave: (address: string, name: string) => {
        setValue("assignee", address, { shouldValidate: true });
      },
    });
  };

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);

    // Reset amount when switching tokens
    // @ts-ignore
    setValue("monthlyAmount", undefined);
  };

  const handleMonthlyBonusChange = (monthKey: string, value: string) => {
    setMonthlyBonusAmounts(prev => ({
      ...prev,
      [monthKey]: value,
    }));
  };

  // Get the number of months between start and end dates
  const numberOfMonths = calculateMonthsBetween(startDate, endDate);

  // Clear monthly bonus amounts when dates change
  React.useEffect(() => {
    setMonthlyBonusAmounts({});
  }, [startDate, endDate]);

  return (
    <div className={`w-full h-full p-5 flex flex-col items-center gap-4 justify-start`}>
      {/* Header */}
      <div className="flex flex-row items-center justify-start gap-3 w-full">
        <img src="/sidebar/payroll.svg" alt="Qash" className="w-6 h-6" />
        <span className="text-2xl font-bold">Create new payroll</span>
      </div>

      {/* Content */}
      <div className="bg-payroll-main-background border border-primary-divider rounded-[20px] flex w-[980px] gap-8">
        {/* Left Section - Basic Information */}
        <div className="w-[45%] p-4 pr-0 flex flex-col gap-3 top-1 sticky h-fit">
          <h2 className="text-text-primary text-lg leading-none">Basic Information</h2>

          {/* Payroll Name Input */}
          <div className="flex flex-col gap-2">
            <div className="bg-background rounded-xl border-b-2 border-primary-divider">
              <div className="flex flex-col gap-1 px-4 py-2">
                <label className="text-text-secondary text-sm font-medium">Payroll name</label>
                <input
                  {...register}
                  type="text"
                  placeholder="Enter payroll name"
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                  autoFocus={true}
                  autoComplete="off"
                />
              </div>
            </div>
            {errors.payrollName && (
              <div className="flex items-center gap-1 pl-2">
                <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                <span className="text-[#E93544] text-sm">{errors.payrollName?.message}</span>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1">
            <div className={`${inputContainerClass} h-[175px] flex flex-col gap-2`}>
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-text-secondary text-sm">Description</p>
                <textarea
                  {...register("description", {
                    maxLength: { value: 250, message: "Description cannot exceed 250 characters" },
                  })}
                  className={`w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary h-full resize-none`}
                  autoComplete="off"
                  placeholder="Write description about this payroll"
                  maxLength={250}
                />
              </div>
            </div>
            <div className="flex justify-between px-3">
              <p className="text-xs text-text-secondary">(Optional)</p>
              <p className="text-xs text-text-secondary">{watch("description")?.length || 0}/250</p>
            </div>
            {errors.description && (
              <div className="flex items-center gap-1 pl-2">
                <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                <span className="text-[#E93544] text-sm">{errors.description.message}</span>
              </div>
            )}
          </div>

          {/* Assignee Input */}
          <div className={`${inputContainerClass} flex items-center justify-between`}>
            <div className="flex flex-col gap-0.5 flex-1">
              <p className={labelClass}>Assignee</p>
              <input
                {...register("assignee", { required: true })}
                type="text"
                autoComplete="off"
                placeholder="Enter wallet address"
                className="outline-none"
              />
            </div>
            <button
              className="bg-app-background flex items-center justify-center rounded-lg w-8 h-8 cursor-pointer border border-primary-divider"
              onClick={handleChooseRecipient}
            >
              <img alt="" className="w-4 h-4" src="/misc/address-book-icon.svg" />
            </button>
          </div>

          {/* Summary Card */}
          <div
            className="bg-background border border-primary-divider rounded-xl overflow-hidden flex flex-col gap-4 items-start justify-end p-4"
            style={{
              backgroundImage: `url(/card/background.svg)`,
              backgroundSize: "contain",
              backgroundPosition: "right",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Amount Summary Section */}
            <div className="border-b border-primary-divider border-dashed flex flex-col items-start w-full gap-3 pb-3">
              {/* Total Fixed Amount */}
              <div className="flex gap-[10px] items-center w-full justify-between">
                <span className="leading-none text-text-secondary text-sm">Total fixed amount</span>
                <span className="leading-none text-text-primary text-lg">5,000 {selectedToken.metadata.symbol}</span>
              </div>

              {/* Total Bonus Amount */}
              <div className="flex gap-[10px] items-center w-full justify-between">
                <span className="leading-none text-text-secondary text-sm">Total bonus amount</span>
                <span className="leading-none text-text-primary text-lg">450 {selectedToken.metadata.symbol}</span>
              </div>
            </div>

            {/* Total Amount to be Locked Section */}
            <div className="flex flex-col gap-2 items-start w-full">
              <span className="leading-none text-text-secondary text-sm">Total amount to be locked</span>

              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2 items-center flex-1">
                  <img
                    src={
                      selectedToken.metadata.symbol === "QASH"
                        ? "/token/qash.svg"
                        : blo(turnBechToHex(selectedToken.faucetId))
                    }
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-text-primary text-lg">5,000 {selectedToken.metadata.symbol}</span>
                </div>
                <PrimaryButton text="Deposit now" containerClassName="w-[120px]" />
              </div>
            </div>
          </div>

          {/* Success Locked Card Background */}

          {/* Success Locked Card */}
          <div className="bg-background rounded-xl flex flex-col gap-4 items-center justify-center p-4 py-6 relative h-full w-full border-b-4 border-[#3EE089] overflow-hidden">
            <img src="/card/background.svg" alt="success locked" className="w-30 h-30 absolute top-0 right-0" />
            <img src="/card/background.svg" alt="success locked" className="w-30 h-30 absolute top-0 -left-5" />

            <span className="text-text-secondary text-sm">You have successfully locked</span>
            <div className="flex flex-row justify-center items-center gap-2 w-fit ">
              <img
                src={
                  selectedToken.metadata.symbol === "QASH"
                    ? "/token/qash.svg"
                    : blo(turnBechToHex(selectedToken.faucetId))
                }
                alt="QASH"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-text-primary text-3xl font-semibold leading-none w-full">
                5,000 {selectedToken.metadata.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Fixed Amount and Other Options */}
        <div className="w-[55%] p-4 pl-0 flex flex-col gap-4 ">
          {/* Fixed Amount Section */}
          <FixedAmount
            isFixedAmountEnabled={isFixedAmountEnabled}
            setIsFixedAmountEnabled={enabled => setIsFixedAmountEnabled(enabled)}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            selectedPayDay={selectedPayDay}
            setSelectedPayDay={setSelectedPayDay}
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            register={register}
            errors={errors}
            isBonusAmountEnabled={isBonusAmountEnabled}
            setIsBonusAmountEnabled={setIsBonusAmountEnabled}
            applyToAll={applyToAll}
            setApplyToAll={setApplyToAll}
            monthlyBonusAmounts={monthlyBonusAmounts}
            handleMonthlyBonusChange={handleMonthlyBonusChange}
            numberOfMonths={numberOfMonths}
            inputContainerClass={inputContainerClass}
            labelClass={labelClass}
          />

          {/* Milestone Setup Toggle */}
          <MilestoneSetup
            isMilestoneSetupEnabled={isMilestoneSetupEnabled}
            setIsMilestoneSetupEnabled={enabled => setIsMilestoneSetupEnabled(enabled)}
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            inputContainerClass={inputContainerClass}
            register={register}
            watch={watch}
            errors={errors}
          />

          {/* Create Button */}
          <PrimaryButton
            text="Create now"
            onClick={handleCreatePayroll}
            disabled={!isFixedAmountEnabled && !isMilestoneSetupEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePayroll;
