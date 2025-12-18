"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useForm } from "react-hook-form";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { ContractTerm } from "./ContractTerm";
import { useTitle } from "@/contexts/TitleProvider";
import { CompanyContactResponseDto } from "@/types/employee";
import { useCreateSandboxPayroll, useGetPayrollDetails, useUpdatePayroll } from "@/services/api/payroll";
import { ContractTermEnum, CreatePayrollDto, UpdatePayrollDto } from "@/types/payroll";
import toast from "react-hot-toast";

interface CreatePayrollFormData {
  employee: string;
  employeeId?: number;
  employeeEmail?: string;
  monthlyAmount: string;
  time: string;
  walletAddress?: string;
  duration?: string;
  durationUnit?: "month" | "year";
  note?: string;
  description?: string;
}

interface CreatePayrollProps {
  onReview: () => void;
  initialFormData?: CreatePayrollFormData;
  initialToken?: AssetWithMetadata;
  initialNetwork?: { icon: string; name: string; value: string } | null;
  initialPayDay?: number;
}

const inputContainerClass = "bg-background rounded-xl p-3 border-b-2 border-primary-divider";
const labelClass = "text-text-secondary text-sm";

const EditPayroll = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payrollId = searchParams.get("id");
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: "",
    metadata: {
      symbol: "",
      decimals: 0,
      maxSupply: 0,
    },
  });
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(null);
  const [selectedPayDay, setSelectedPayDay] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatePayrollFormData>({
    mode: "onChange",
    defaultValues: {
      time: "10:00",
      employee: "",
      employeeEmail: "",
      monthlyAmount: "",
      walletAddress: "",
      duration: "",
      durationUnit: "month",
      note: "",
      description: "",
    },
  });

  // Fetch payroll data if ID exists
  const { data: payrollData, isLoading } = useGetPayrollDetails(payrollId ? parseInt(payrollId) : 0);

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    const isEditMode = !!payrollId;
    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Payroll /</span>
        <span className="text-text-primary">{isEditMode ? "Edit payroll" : "Create new payroll"}</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router, payrollId]);

  // Populate form data when payroll data is fetched
  useEffect(() => {
    if (payrollData) {
      const startDate = new Date(payrollData.payStartDate);
      const payDay = startDate.getDate();

      // Update form values
      setValue("employee", payrollData.employee.name, { shouldValidate: true });
      setValue("employeeId", payrollData.employee.id, { shouldValidate: true });
      setValue("employeeEmail", payrollData.employee.email, { shouldValidate: true });
      setValue("monthlyAmount", payrollData.amount.toString(), { shouldValidate: true });
      setValue("walletAddress", payrollData.employee.walletAddress || "", { shouldValidate: true });
      setValue("duration", payrollData.payrollCycle?.toString() || "", { shouldValidate: true });
      setValue("durationUnit", payrollData.metadata?.durationUnit || "month", { shouldValidate: true });
      setValue("note", payrollData.note || "", { shouldValidate: true });
      setValue("description", payrollData.description || "", { shouldValidate: true });

      // Set selected pay day
      setSelectedPayDay(payDay);

      // Set token
      const token: AssetWithMetadata = {
        amount: payrollData.amount.toString(),
        faucetId: payrollData.token.address || "",
        metadata: {
          symbol: payrollData.token.symbol,
          decimals: payrollData.token.decimals,
          maxSupply: 0,
        },
      };
      setSelectedToken(token);

      // Set network
      const mockNetwork = {
        icon: "/chain/miden.svg",
        name: payrollData.network.name,
        value: payrollData.network.chainId.toString(),
      };
      setSelectedNetwork(mockNetwork);
    }
  }, [payrollData, setValue]);

  // Only build the DTO and pass to onCreate, do not call API here
  const { mutateAsync: updatePayroll } = useUpdatePayroll();

  const handleBuildPayrollDto = async (formData: CreatePayrollFormData) => {
    const {
      employeeId,
      employeeEmail,
      walletAddress,
      duration,
      durationUnit,
      monthlyAmount,
      description,
      note,
      employee,
    } = formData;

    if (!selectedNetwork || !selectedToken.metadata.symbol || !employeeId) {
      toast.error("Missing required fields");
      return;
    }

    if (!duration || !durationUnit) {
      toast.error("Please enter contract duration and select duration unit");
      return;
    }

    const durationValue = parseInt(duration);
    const payStart = new Date();
    payStart.setDate(selectedPayDay);
    const payEnd = new Date(payStart);
    if (durationUnit === "year") {
      payEnd.setFullYear(payEnd.getFullYear() + durationValue);
    } else {
      payEnd.setMonth(payEnd.getMonth() + durationValue);
    }

    const updatePayrollDto: UpdatePayrollDto = {
      network: {
        name: selectedNetwork.name,
        chainId: parseInt(selectedNetwork.value),
        description: selectedNetwork.name,
        metadata: {},
      },
      token: {
        address: selectedToken.faucetId, // Use faucetId or provide a default address
        symbol: selectedToken.metadata.symbol,
        decimals: selectedToken.metadata.decimals,
        name: selectedToken.metadata.symbol,
        metadata: {},
      },
      payday: payStart.getDate(),
      contractTerm: ContractTermEnum.PERMANENT,
      payrollCycle: durationValue,
      amount: monthlyAmount,
      note: note,
      metadata: {
        payDay: selectedPayDay,
        durationUnit,
      },
    };

    setIsSubmitting(true);
    try {
      await updatePayroll({ id: employeeId, data: updatePayrollDto });

      toast.success("Payroll updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Error updating payroll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_RECIPIENT, {
      onSave: (employee: CompanyContactResponseDto) => {
        setValue("employee", employee.name, { shouldValidate: true });
        setValue("employeeId", employee.id, { shouldValidate: true });
        setValue("walletAddress", employee.walletAddress, { shouldValidate: true });
        setValue("employeeEmail", employee.email, { shouldValidate: true });
      },
    });
  };

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);
    setValue("monthlyAmount", "");
  };

  const handleNetworkSelect = (network: { icon: string; name: string; value: string }) => {
    setSelectedNetwork(network);
  };

  if (payrollId && isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-text-secondary">Loading payroll details...</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full p-5 flex flex-col items-center gap-4 justify-start`}>
      {/* Header */}
      <div className="flex flex-row items-center justify-start gap-3 w-full">
        <img src="/sidebar/payroll.svg" alt="Qash" className="w-6 h-6" />
        <span className="text-2xl font-bold">Edit payroll</span>
      </div>

      {/* Content */}
      <div className="bg-payroll-main-background border border-primary-divider rounded-[20px] flex w-[980px] gap-8">
        {/* Left Section - Basic Information */}
        <div className="w-[45%] p-4 pr-0 flex flex-col gap-3 top-1 sticky h-fit">
          <h2 className="text-text-primary text-lg leading-none">Basic Information</h2>

          {/* Employee Input */}
          <div className={`${inputContainerClass} flex items-center justify-between`}>
            <div className="flex flex-col gap-0.5 flex-1">
              <p className={labelClass}>Employee</p>
              <input
                {...register("employee", { required: true })}
                type="text"
                autoComplete="off"
                placeholder="Enter full name"
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

          {/* Network Selector */}
          <div
            className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
            onClick={() =>
              openModal(MODAL_IDS.SELECT_NETWORK, {
                selectedNetwork,
                onNetworkSelect: handleNetworkSelect,
              })
            }
          >
            <div className="flex gap-3 items-center">
              {selectedNetwork ? (
                <>
                  <img alt="" className="w-10 rounded-lg" src={selectedNetwork.icon} />
                  <div className="flex flex-col">
                    <p className="text-text-secondary text-sm">Payment network</p>
                    <p className="text-text-primary text-sm font-bold">{selectedNetwork.name}</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-1">Select network</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>

          {/* Token Selector */}
          <div
            className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
            onClick={() =>
              openModal(MODAL_IDS.SELECT_TOKEN, {
                selectedToken,
                onTokenSelect: handleTokenSelect,
              })
            }
          >
            <div className="flex gap-3 items-center">
              {selectedToken.metadata.symbol ? (
                <>
                  <div className="relative w-10 h-10">
                    <img
                      alt=""
                      className="w-full h-full"
                      src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                    />
                    <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                    <p className="text-text-secondary text-sm">Miden</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-1">Select token</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-background rounded-xl border-b-2 border-primary-divider">
              <div className="flex flex-col gap-1 px-4 py-2">
                <label className="text-text-secondary text-sm font-medium">Wallet address</label>
                <input
                  {...register("walletAddress")}
                  type="text"
                  placeholder="Paste wallet address"
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                  autoFocus={true}
                  autoComplete="off"
                />
              </div>
            </div>
            {errors.walletAddress && (
              <div className="flex items-center gap-1 pl-2">
                <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                <span className="text-[#E93544] text-sm">{errors.walletAddress?.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Fixed Amount and Other Options */}
        <div className="w-[55%] p-4 pl-0 flex flex-col gap-4 ">
          {/* Contract Term Section */}
          <ContractTerm
            selectedToken={selectedToken}
            selectedPayDay={selectedPayDay}
            setSelectedPayDay={setSelectedPayDay}
            register={register}
            errors={errors}
            inputContainerClass={inputContainerClass}
            labelClass={labelClass}
          />

          {/* Create Button */}
          <PrimaryButton
            text="Save changes"
            onClick={handleSubmit(handleBuildPayrollDto)}
            disabled={isSubmitting || !selectedNetwork || !selectedToken.metadata.symbol}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPayroll;
