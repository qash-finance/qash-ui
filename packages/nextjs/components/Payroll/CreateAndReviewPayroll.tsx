"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useForm } from "react-hook-form";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { ContractTerm } from "./ContractTerm";
import { useTitle } from "@/contexts/TitleProvider";
import { CompanyContactResponseDto } from "@/types/employee";
import { useCreatePayroll } from "@/services/api/payroll";
import { Company, useGetMyCompany } from "@/services/api/company";
import { ContractTermEnum, CreatePayrollDto } from "@/types/payroll";
import toast from "react-hot-toast";
import { SecondaryButton } from "../Common/SecondaryButton";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useAuth } from "@/services/auth/context";
import { AuthMeResponse } from "@/services/auth/api";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";

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

type Step = "create" | "review";

const inputContainerClass = "bg-background rounded-xl p-3 border-b-2 border-primary-divider";
const labelClass = "text-text-secondary text-sm";

interface EmployeeInfo {
  name: string;
  email?: string;
  walletAddress?: string;
}

interface ReviewPayrollProps {
  onBackAndEdit: () => void;
  payrollDto: CreatePayrollDto;
  employee: EmployeeInfo;
  owner: AuthMeResponse["user"];
  company: Company;
}

interface CreatePayrollProps {
  onReview: (
    dto: CreatePayrollDto,
    employee: EmployeeInfo,
    formData: CreatePayrollFormData,
    token: AssetWithMetadata,
    network: { icon: string; name: string; value: string } | null,
    payDay: number,
  ) => void;
  initialFormData?: CreatePayrollFormData;
  initialToken?: AssetWithMetadata | null;
  initialNetwork?: { icon: string; name: string; value: string } | null;
  initialPayDay?: number;
}

const CreatePayroll = ({
  onReview,
  initialFormData,
  initialToken,
  initialNetwork,
  initialPayDay = 1,
}: CreatePayrollProps) => {
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(initialToken || null);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(
    initialNetwork || null,
  );
  const [selectedPayDay, setSelectedPayDay] = useState(initialPayDay ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CreatePayrollFormData>({
    mode: "onChange",
    defaultValues: initialFormData || {
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

  // Only build the DTO and pass to onCreate, do not call API here
  const handleBuildPayrollDto = (formData: CreatePayrollFormData) => {
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

    if (!selectedNetwork || !selectedToken || !selectedToken.metadata.symbol || !employeeId || !description) {
      toast.error("Missing required fields");
      return;
    }

    if (!duration || !durationUnit) {
      toast.error("Please enter contract duration and select duration unit");
      return;
    }

    let durationValue = parseInt(duration);
    const payStart = new Date(); //pay start is always starting next month
    payStart.setDate(selectedPayDay);
    payStart.setMonth(payStart.getMonth() + 1);
    const payEnd = new Date(payStart);
    if (durationUnit === "year") {
      payEnd.setFullYear(payEnd.getFullYear() + durationValue);
      durationValue = durationValue * 12;
    } else {
      payEnd.setMonth(payEnd.getMonth() + durationValue);
    }

    const createPayrollDto: CreatePayrollDto = {
      employeeId: employeeId,
      network: {
        name: selectedNetwork.name,
        chainId: parseInt(selectedNetwork.value),
        description: selectedNetwork.name,
        metadata: {},
      },
      token: {
        address: selectedToken.faucetId || "", // Use selected token faucetId when available
        symbol: selectedToken.metadata.symbol,
        decimals: selectedToken.metadata.decimals,
        name: selectedToken.metadata.symbol,
        metadata: {},
      },
      contractTerm: ContractTermEnum.PERMANENT,
      payrollCycle: durationValue,
      amount: monthlyAmount,
      payStartDate: payStart.toISOString(),
      joiningDate: payStart.toISOString(),
      payEndDate: payEnd.toISOString(),
      description: description,
      note: note,
      metadata: {
        payDay: selectedPayDay,
        durationUnit,
      },
    };

    onReview(
      createPayrollDto,
      {
        name: employee,
        email: employeeEmail,
        walletAddress: walletAddress,
      },
      formData,
      selectedToken,
      selectedNetwork,
      selectedPayDay,
    );
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_EMPLOYEE, {
      onSave: (employee: CompanyContactResponseDto) => {
        setValue("employee", employee.name, { shouldValidate: true });
        setValue("employeeId", employee.id, { shouldValidate: true });
        setValue("walletAddress", employee.walletAddress, { shouldValidate: true });
        setValue("employeeEmail", employee.email, { shouldValidate: true });

        // populate network from contact
        if (employee.network) {
          setSelectedNetwork({
            icon: "/chain/miden.svg",
            name: employee.network.name,
            value: String(employee.network.chainId),
          });
        }

        // populate token from contact if provided
        if (employee.token) {
          setSelectedToken({
            amount: "0",
            faucetId: employee.token.address || "",
            metadata: {
              symbol: employee.token.symbol,
              decimals: employee.token.decimals || 0,
              maxSupply: employee.token.maxSupply || 0,
            },
          });
        }
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

  const selectedEmployeeName = watch("employee");

  return (
    <>
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

          {/* Employee Selector */}
          <div
            className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
            onClick={handleChooseRecipient}
          >
            <div className="flex gap-3 items-center flex-1">
              {selectedEmployeeName ? (
                <>
                  <div className="bg-app-background flex items-center justify-center rounded-lg w-10 h-10 border border-primary-divider">
                    <img alt="" className="w-5 h-5" src="/misc/address-book-icon.svg" />
                  </div>
                  <div className="flex flex-col">
                    <p className={labelClass}>Employee</p>
                    <p className="text-text-primary text-sm font-bold">{selectedEmployeeName}</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-1">Select employee</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>
          {/* Hidden input for form validation */}
          <input type="hidden" {...register("employee", { required: true })} />

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
              {selectedToken && selectedToken.metadata.symbol ? (
                <>
                  <div className="relative w-10 h-10">
                    <img
                      alt=""
                      className="w-full h-full rounded-full"
                      src={
                        selectedToken.metadata.symbol === "QASH"
                          ? "/q3x-icon.png"
                          : blo(turnBechToHex(selectedToken.faucetId))
                      }
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
            setValue={setValue}
            inputContainerClass={inputContainerClass}
            labelClass={labelClass}
          />

          {/* Create Button */}
          <PrimaryButton
            text="Create now"
            onClick={handleSubmit(handleBuildPayrollDto)}
            disabled={isSubmitting || !selectedNetwork || !selectedToken?.metadata?.symbol || !isValid}
          />
        </div>
      </div>
    </>
  );
};

// Helper: Convert CreatePayrollDto to InvoiceData

function createInvoiceDataFromPayroll(
  payroll: CreatePayrollDto,
  company?: any,
  employee?: EmployeeInfo,
  owner?: AuthMeResponse["user"],
): any {
  if (!payroll || !company || !employee || !owner) {
    console.warn("Missing data to create invoice");
    return null;
  }

  const employeeName = employee?.name;
  const dueDate = new Date(payroll.payStartDate);
  // Invoice date should be 5 days before due date
  const invoiceDate = new Date(dueDate);
  invoiceDate.setDate(dueDate.getDate() - 5);
  const billToName = company?.companyName;
  const billToEmail = owner?.email;

  return {
    invoiceNumber: `INV0001`,
    date: invoiceDate.toISOString().split("T")[0],
    dueDate: payroll.payStartDate.split("T")[0],
    from: {
      name: employeeName,
      email: employee?.email,
      company: company?.companyName,
      // address: [company?.address1, company?.address2, company?.city, company?.country, company?.postalCode]
      //   .filter(Boolean)
      //   .join(", "),
      token: payroll?.token?.symbol || "QASH",
      network: payroll?.network?.name || "Miden Testnet",
      walletAddress: employee.walletAddress,
    },
    billTo: {
      name: billToName,
      email: billToEmail,
      company: company?.companyName,
      address: [company?.address1, company?.address2, company?.city, company?.country, company?.postalCode]
        .filter(Boolean)
        .join(", "),
    },
    items: [
      {
        description: payroll?.description || "Payroll Payment",
        price: Number(payroll?.amount),
        qty: 1,
        amount: Number(payroll?.amount),
      },
    ],
    subtotal: Number(payroll?.amount),
    total: Number(payroll?.amount),
    currency: payroll?.token?.symbol || "QASH",
  };
}

const ReviewPayroll = ({ onBackAndEdit, payrollDto, employee, owner, company }: ReviewPayrollProps) => {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const router = useRouter();

  const { mutateAsync: createPayroll } = useCreatePayroll();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAndCreate = async () => {
    setIsSubmitting(true);
    try {
      await createPayroll({
        employeeId: payrollDto.employeeId,
        network: payrollDto.network,
        token: payrollDto.token,
        contractTerm: payrollDto.contractTerm,
        payrollCycle: payrollDto.payrollCycle,
        amount: payrollDto.amount,
        joiningDate: payrollDto.joiningDate,
        payday: payrollDto.metadata?.payDay,
        generateDaysBefore: 5,
        description: payrollDto.description,
      }).catch(err => {
        throw err;
      });

      toast.success("Payroll created successfully");

      setTimeout(() => {
        router.push("/payroll");
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || "Error creating payroll");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const data = createInvoiceDataFromPayroll(payrollDto, company, employee, owner);
    setInvoiceData(data);
  }, [payrollDto, employee]);

  if (!invoiceData) {
    return <div>Loading invoice preview...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-row items-center justify-start gap-3 w-full">
        <img src="/sidebar/payroll.svg" alt="Qash" className="w-6 h-6" />
        <span className="text-2xl font-bold">Review payroll</span>
      </div>

      <div className="w-full h-full flex-row flex">
        <div className="flex flex-col items-center justify-center w-full h-full gap-8">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex flex-col items-center gap-2 w-full">
              <img src="/misc/blue-review-invoice-icon.svg" alt="password-check" className="w-12 h-12" />

              <p className="font-barlow font-medium text-[32px] leading-[1] tracking-[-0.01em] text-text-primary text-center w-[318px]">
                Review & Confirm Monthly Invoice from {invoiceData.from.name}
              </p>
            </div>
            <div className="font-barlow font-medium text-base leading-6 text-text-secondary text-center w-[440px]">
              <p>Preview the invoice that will be generated for your employee. </p>
              <p>Make sure all payment details are accurate before confirming.</p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 items-start" data-node-id="2626:120802">
            {/* Edit Payroll Button */}
            <SecondaryButton
              text="Edit payroll"
              onClick={() => {
                onBackAndEdit();
              }}
              buttonClassName="w-40"
              icon="/misc/edit-icon.svg"
              iconPosition="left"
              variant="light"
              disabled={isSubmitting}
            />
            {/* Confirm and Create Button */}
            <PrimaryButton
              text={isSubmitting ? "Creating..." : "Confirm and create"}
              onClick={handleConfirmAndCreate}
              containerClassName="w-50"
              icon="/misc/document-forward-icon.svg"
              iconPosition="left"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <InvoicePreview {...invoiceData} />
      </div>
    </div>
  );
};

const CreateAndReviewPayroll = () => {
  const { user } = useAuth();
  const { data: company } = useGetMyCompany();
  const router = useRouter();
  const [step, setStep] = useState<Step>("create");
  const [payrollDto, setPayrollDto] = useState<CreatePayrollDto | null>(null);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [formData, setFormData] = useState<CreatePayrollFormData | undefined>(undefined);
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(null);
  const [selectedPayDay, setSelectedPayDay] = useState<number | undefined>(undefined);
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Payroll /</span>
        <span className="text-text-primary">Create new payroll</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router]);

  const onReview = (
    dto: CreatePayrollDto,
    emp: EmployeeInfo,
    formDataToSave: CreatePayrollFormData,
    tokenToSave: AssetWithMetadata,
    networkToSave: { icon: string; name: string; value: string } | null,
    payDayToSave: number,
  ) => {
    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Create new payroll /</span>
        <span className="text-text-primary">Review payroll</span>
      </div>,
    );
    setFormData(formDataToSave);
    setSelectedToken(tokenToSave);
    setSelectedNetwork(networkToSave);
    setSelectedPayDay(payDayToSave);
    setPayrollDto(dto);
    setEmployee(emp);
    setStep("review");
  };

  const renderContent = () => {
    switch (step) {
      case "create":
        return (
          <CreatePayroll
            onReview={(dto, emp, formDataToSave, tokenToSave, networkToSave, payDayToSave) =>
              onReview(dto, emp, formDataToSave, tokenToSave, networkToSave, payDayToSave)
            }
            initialFormData={formData}
            initialToken={selectedToken}
            initialNetwork={selectedNetwork}
            initialPayDay={selectedPayDay}
          />
        );
      case "review":
        return payrollDto && employee && user && company ? (
          <ReviewPayroll
            onBackAndEdit={() => setStep("create")}
            payrollDto={payrollDto}
            employee={employee}
            company={company}
            owner={user as AuthMeResponse["user"]}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <div className={`w-full h-full p-5 flex flex-col items-center gap-4 justify-start`}>{renderContent()}</div>;
};

export default CreateAndReviewPayroll;
