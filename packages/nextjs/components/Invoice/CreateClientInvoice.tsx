"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import InputOutlined from "@/components/Common/Input/InputOutlined";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { RecurringIntervalDropdown } from "@/components/Common/Dropdown/RecurringIntervalDropdown";
import { DatePickerDropdown } from "@/components/Common/Dropdown/DatePickerDropdown";
import { DueDateDropdown } from "@/components/Common/Dropdown/DueDateDropdown";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useModal } from "@/contexts/ModalManagerProvider";
import { createB2BInvoice, sendB2BInvoice, createB2BSchedule } from "@/services/api/invoice";
import { useGetMyCompany } from "@/services/api/company";
import {
  CreateB2BInvoiceDto,
  CreateB2BScheduleDto,
  Currency,
  InvoiceItemDto,
  NetworkDto,
  TokenDto,
  B2BFromDetailsDto,
  UnregisteredCompanyDto,
  InvoiceModel,
} from "@/types/invoice";
import { ClientResponseDto } from "@/types/client";
import { AssetWithMetadata } from "@/types/faucet";
import { useAuth } from "@/services/auth/context";
import { AuthMeResponse } from "@/services/auth/api";
import { InvoiceModalProps } from "@/types/modal";

const LAST_STEP = 4;

interface PaymentMethod {
  id: string;
  name: string;
  balance: string;
  color: string;
  icon?: string;
}

// UI-friendly item structure
interface FormItem {
  description: string;
  price: string;
  qty: string;
  amount: string;
}

// Extended FormData interface matching both UI needs and backend requirements
interface FormData {
  // From details (sender)
  name: string;
  companyName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;

  // Invoice details
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;

  // Bill to details (recipient - unregistered company)
  clientId: string; // UUID of existing client (optional)
  billToCompanyName: string;
  billToContactName: string;
  billToEmail: string;
  billToAddress: string;
  billToCcEmails: string[];
  billToTaxId: string;

  // Payment details
  token: TokenDto | null;
  network: NetworkDto | null;
  walletAddress: string;

  // Invoice items
  items: FormItem[];

  // Additional fields
  taxRate: string;
  discount: string;
  note: string;

  // Email customization
  emailSubject: string;
  emailBody: string;
  emailBcc: string[];

  // Payment collection type
  paymentCollectionType: "one-time" | "recurring";
  recurringInterval: string;
  recurringStartDate: string;

  // Internal UI state
  paymentMethodId: string;
}

const CreateClientInvoice = () => {
  const { openModal } = useModal();
  const router = useRouter();
  const { user } = useAuth();
  const { data: myCompany, isLoading: companyLoading } = useGetMyCompany();
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [expandAdditionalDetails, setExpandAdditionalDetails] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [ccEmailInput, setCcEmailInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    mode: "onBlur",
    defaultValues: {
      // From details (sender)
      name: "",
      email: "",
      state: "",
      country: "",
      postalCode: "",
      taxId: "",

      // Invoice details
      invoiceNumber: "",
      issueDate: new Date().toISOString(),
      dueDate: "",
      currency: Currency.USD,

      // Bill to details (recipient)
      clientId: "",
      billToCompanyName: "",
      billToContactName: "",
      billToEmail: "",
      billToAddress: "",
      billToCcEmails: [],
      billToTaxId: "",

      // Payment details - default to Miden network
      token: {
        address: "",
        symbol: "",
        decimals: 0,
        name: "",
      },
      network: {
        name: "",
        chainId: 1,
      },
      walletAddress: "",

      // Invoice items
      items: [],

      // Additional fields
      taxRate: "0",
      discount: "0",
      note: "",

      // Email customization
      emailSubject: "",
      emailBody: "",
      emailBcc: [],

      // Payment collection type
      paymentCollectionType: "one-time",
      recurringInterval: "MONTHLY",
      recurringStartDate: "",

      // Internal UI state
      paymentMethodId: "payroll",
    },
  });

  // Get current form values
  const formData = watch();

  // Auto-populate Step 1 with company data
  useEffect(() => {
    if (myCompany) {
      const address = [myCompany.address1, myCompany.address2, myCompany.city, myCompany.postalCode]
        .filter(Boolean)
        .join(", ");

      setValue("companyName", myCompany.companyName);
      setValue("address", address);
    }
  }, [myCompany]);

  useEffect(() => {
    if (user) {
      const first = (user as AuthMeResponse["user"])?.teamMembership?.firstName ?? "";
      const last = (user as AuthMeResponse["user"])?.teamMembership?.lastName ?? "";
      const fullName = [first, last].filter(Boolean).join(" ");
      const email = (user as AuthMeResponse["user"])?.email ?? "";
      if (fullName) {
        setValue("name", fullName);
      }
      if (email) {
        setValue("email", email);
      }
    }
  }, [user]);

  // Calculate totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty) || 0;
      return sum + price * qty;
    }, 0);

    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discount = parseFloat(formData.discount) || 0;
    const total = subtotal + taxAmount - discount;

    return { subtotal, taxAmount, total };
  }, [formData.items, formData.taxRate, formData.discount]);

  // Convert form data to API DTO
  const buildCreateInvoiceDto = (): CreateB2BInvoiceDto => {
    // Map form items to API items
    const items: InvoiceItemDto[] = formData.items.map((item, index) => ({
      description: item.description,
      quantity: item.qty,
      unitPrice: item.price,
      total: item.amount || String(parseFloat(item.price) * parseInt(item.qty)),
      order: index,
    }));

    // Build from details
    const fromDetails: B2BFromDetailsDto = {
      companyName: formData.companyName,
      contactName: formData.name,
      email: formData.email,
      address1: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      postalCode: formData.postalCode,
      taxId: formData.taxId,
    };

    // Build unregistered company details (bill to)
    const unregisteredCompany: UnregisteredCompanyDto | undefined = formData.clientId
      ? undefined
      : {
          companyName: formData.billToCompanyName,
          email: formData.billToEmail,
          ccEmails: formData.billToCcEmails.filter(Boolean),
          contactName: formData.billToContactName,
          address: formData.billToAddress,
          taxId: formData.billToTaxId,
        };

    const dto: CreateB2BInvoiceDto = {
      clientId: formData.clientId || undefined,
      unregisteredCompany,
      issueDate: formData.issueDate || new Date().toISOString(),
      dueDate: formData.dueDate,
      currency: formData.currency,
      items,
      network: formData.network!,
      token: formData.token!,
      walletAddress: formData.walletAddress,
      fromDetails,
      emailSubject: formData.emailSubject || undefined,
      emailBody: formData.emailBody || undefined,
      emailBcc: formData.emailBcc.filter(Boolean),
      taxRate: formData.taxRate,
      discount: formData.discount,
      memo: formData.note ? { text: formData.note } : undefined,
    };

    return dto;
  };

  // Build schedule DTO for recurring invoices
  const buildCreateScheduleDto = (invoiceUUID: string): CreateB2BScheduleDto => {
    return {
      clientId: formData.clientId || invoiceUUID, // Use invoice UUID as reference
      frequency: formData.recurringInterval,
      generateDaysBefore: 7,
      dueDaysAfterGeneration: 30,
      autoSend: true,
      invoiceTemplate: {
        items: formData.items.map((item, index) => ({
          description: item.description,
          quantity: item.qty,
          unitPrice: item.price,
          total: item.amount,
          order: index,
        })),
        currency: formData.currency,
        network: formData.network!,
        token: formData.token!,
        walletAddress: formData.walletAddress,
        taxRate: formData.taxRate,
        discount: formData.discount,
        memo: formData.note ? { text: formData.note } : undefined,
        emailSubject: formData.emailSubject,
        emailBody: formData.emailBody,
      },
    };
  };

  const paymentMethods: PaymentMethod[] = [
    { id: "payroll", name: "Payroll", balance: "$125,545.00", color: "bg-blue-500", icon: "payroll" },
    { id: "earning", name: "Earning", balance: "$12,745.00", color: "bg-orange-400", icon: "earning" },
    { id: "accounting", name: "Accounting", balance: "$5,545.00", color: "bg-purple-500", icon: "accounting" },
  ];

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case "payroll":
        // Payroll icon - wallet/briefcase
        return <img src="/client-invoice/payroll-icon.svg" alt="payroll" className="w-10" />;
      case "earning":
        // Earning icon - trending up/chart
        return <img src="/client-invoice/earning-icon.svg" alt="earning" className="w-10" />;
      case "accounting":
        // Accounting icon - calculator/document
        return <img src="/client-invoice/accounting-icon.svg" alt="accounting" className="w-10" />;
    }
  };

  // Handle client selection from modal
  const handleClientSelect = (client: ClientResponseDto) => {
    setValue("clientId", client.uuid);
    setValue("billToCompanyName", client.companyName);
    setValue("billToEmail", client.email);
    setValue("billToContactName", "");
    setValue(
      "billToAddress",
      [client.address1, client.address2, client.city, client.state, client.postalCode, client.country]
        .filter(Boolean)
        .join(", "),
    );
    setValue("billToTaxId", client.taxId || "");
  };

  // Handle token selection from modal
  const handleTokenSelect = (token: AssetWithMetadata | null) => {
    if (!token) return;

    setValue("token", {
      address: token.faucetId,
      symbol: token.metadata.symbol,
      decimals: token.metadata.decimals,
      name: token.metadata.symbol,
    });
  };

  const handleNetworkSelect = (network: { icon: string; name: string; value: string }) => {
    setSelectedNetwork(network);
    setValue("network", {
      name: network.name,
      chainId: 1,
    });
  };

  // Handle adding CC email
  const handleAddCcEmail = () => {
    const email = ccEmailInput.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email already exists
    if (formData.billToCcEmails.includes(email)) {
      toast.error("Email already added");
      return;
    }

    // Add email to the list
    setValue("billToCcEmails", [...formData.billToCcEmails, email]);

    // Clear input
    setCcEmailInput("");
  };

  // Handle removing CC email
  const handleRemoveCcEmail = (index: number) => {
    setValue(
      "billToCcEmails",
      formData.billToCcEmails.filter((_, i) => i !== index),
    );
  };

  // Handle CC email input key press
  const handleCcEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCcEmail();
    }
  };

  // Handle CC email input blur - add email when clicking outside
  const handleCcEmailBlur = () => {
    const email = ccEmailInput.trim();
    if (!email) return; // Silently skip empty input on blur

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.billToCcEmails.includes(email)) {
      toast.error("Email already added");
      return;
    }

    setValue("billToCcEmails", [...formData.billToCcEmails, email]);
    setCcEmailInput("");
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dto = buildCreateInvoiceDto();
      const response = await createB2BInvoice(dto);

      if (response.data) {
        setCreatedInvoice(response.data);
        toast.success("Draft saved successfully");
        console.log("Draft saved:", response.data);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save draft";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error saving draft:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInvoiceData = (): string | null => {
    // Validate dueDate for one-time payments
    if (formData.paymentCollectionType === "one-time" && !formData.dueDate) {
      return "Please select a due date for the invoice.";
    }

    // Validate walletAddress
    if (!formData.walletAddress || formData.walletAddress.trim() === "") {
      return "Please enter a wallet address to receive payment.";
    }

    // Validate items
    if (formData.items.length === 0) {
      return "Please add at least one item to the invoice.";
    }

    // Validate recipient information
    if (!formData.clientId && !formData.billToCompanyName) {
      return "Please select a client or enter company information.";
    }

    if (!formData.clientId && !formData.billToEmail) {
      return "Please enter recipient email address.";
    }

    return null;
  };

  const handleSendInvoice = async () => {
    // Validate before sending
    const validationError = validateInvoiceData();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First create the invoice if not already created
      let invoice = createdInvoice;

      if (!invoice) {
        const dto = buildCreateInvoiceDto();
        const createResponse = await createB2BInvoice(dto);
        invoice = createResponse;
        setCreatedInvoice(invoice);
      }

      if (!invoice?.uuid) {
        throw new Error("Failed to create invoice");
      }

      // Send the invoice
      await sendB2BInvoice(invoice.uuid);

      // If recurring, create a schedule
      // if (formData.paymentCollectionType === "recurring") {
      //   const scheduleDto = buildCreateScheduleDto(invoice.uuid);
      //   await createB2BSchedule(scheduleDto);
      // }

      setInvoiceSent(true);
      toast.success("Invoice sent successfully!");
    } catch (err: any) {
      console.log("🚀 ~ handleSendInvoice ~ err:", err);
      // Handle validation errors from backend
      let errorMessage: string;
      if (err.response?.data?.message) {
        const messages = Array.isArray(err.response.data.message)
          ? err.response.data.message
              .map((m: any) => {
                if (typeof m === "object" && m.constraints) {
                  return Object.values(m.constraints).join(", ");
                }
                return m;
              })
              .join("; ")
          : err.response.data.message;
        errorMessage = messages;
      } else {
        errorMessage = err.message || "Failed to send invoice";
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error sending invoice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Prevent advancing from Step 2 if recipient info is missing
    if (currentStep === 2 && !formData.billToCompanyName && !formData.billToEmail) {
      const msg = "Please select a client or enter recipient company or email.";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validate Step 3 fields: token, network, wallet address, and item details
    if (currentStep === 3) {
      // Require due date for one-time payments
      if (formData.paymentCollectionType === "one-time" && (!formData.dueDate || formData.dueDate.trim() === "")) {
        const msg = "Please select a due date for the invoice.";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (!formData.token || !formData.token.symbol) {
        const msg = "Please select a token to receive payment.";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (!formData.network || !formData.network.name) {
        const msg = "Please select a network.";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (!formData.walletAddress || formData.walletAddress.trim() === "") {
        const msg = "Please enter a wallet address to receive payment.";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (formData.items.length === 0) {
        const msg = "Please add at least one item to the invoice.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const invalidItem = formData.items.find(
        item => !item.description || item.description.trim() === "" || !item.price || item.price.trim() === "",
      );

      if (invalidItem) {
        const msg = "Please make sure each item has a description and price.";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    if (currentStep < LAST_STEP) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === LAST_STEP) {
      // Send invoice
      handleSendInvoice();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep => {
      if (currentStep > 1) {
        return currentStep - 1;
      }
      return currentStep;
    });
  };

  const handleAddItem = () => {
    const newItems = [...formData.items, { description: "", price: "", qty: "1", amount: "0" }];
    setValue("items", newItems);
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    item[field] = value;

    // Calculate amount if price or qty changes
    if (field === "price" || field === "qty") {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty) || 0;
      item.amount = String(price * qty);
    }

    newItems[index] = item;
    setValue("items", newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setValue("items", newItems);
  };

  // Format an ISO or other date string into dd-mm-yyyy for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr; // if not parseable, return as-is
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const StepIndicator = () => (
    <div className="flex gap-8 items-center justify-center w-full px-12">
      {[1, 2, 3, 4].map(step => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-500 ${
              step === currentStep
                ? "border-primary-blue text-primary-blue"
                : step < currentStep
                  ? "border-primary-blue bg-primary-blue"
                  : "border-primary-divider text-text-secondary"
            }`}
          >
            {step < currentStep ? (
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{
                  animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          {step < LAST_STEP && (
            <div
              className="flex-1 h-[1px] transition-all duration-700"
              style={{
                background: step < currentStep ? "var(--primary-blue)" : "var(--primary-divider)",
                opacity: step < currentStep ? 1 : 0.5,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-6 items-start w-full">
            {/* Title */}
            <div className="flex flex-col gap-2 items-start w-full">
              <h1 className="text-3xl font-medium leading-tight">Check your information</h1>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Name Input */}
              <InputOutlined label="Name" placeholder="Enter your name" {...register("name")} />

              {/* Company Name Input */}
              <InputOutlined label="Company name" placeholder="Enter your company name" {...register("companyName")} />

              {/* Email Input */}
              <InputOutlined label="Email" placeholder="qashcompany@gmail.com" type="email" {...register("email")} />

              {/* Additional Details Toggle */}
              <button
                onClick={() => setExpandAdditionalDetails(!expandAdditionalDetails)}
                className="flex gap-2 items-center text-text-secondary cursor-pointer"
              >
                <span className="font-medium text-base">Additional details</span>
                <img
                  src="/arrow/chevron-right.svg"
                  alt="expand"
                  className={`w-5 h-5 transition-transform ${expandAdditionalDetails ? "rotate-90" : ""}`}
                />
              </button>

              {/* Additional Fields */}
              {expandAdditionalDetails && (
                <>
                  {/* Address Input */}
                  <InputOutlined label="Address" placeholder="Enter address" {...register("address")} />

                  {/* Tax ID Input */}
                  {/* <InputOutlined
                    label="Tax ID"
                    placeholder="Enter tax ID..."
                    {...register("taxId")}
                  /> */}
                </>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-6 items-start w-full">
            {/* Title */}
            <div className="flex flex-col gap-2 items-start w-full">
              <h1 className="text-3xl font-medium leading-tight">Who this invoice for?</h1>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Bill To Company Name Input with People Icon */}
              <InputOutlined
                label="Company name"
                placeholder="Select contact"
                value={formData.billToCompanyName}
                onChange={() => {}} // Read-only, click icon to select
                readOnly
                icon="/misc/address-book-icon.svg"
                iconOnClick={() => openModal("SELECT_CLIENT", { onSave: handleClientSelect })}
              />

              {/* Bill To Email Input */}
              <InputOutlined
                label="Email"
                placeholder="qashcompany@gmail.com"
                type="email"
                {...register("billToEmail")}
              />

              {/* Additional Details Toggle */}
              <button
                onClick={() => setExpandAdditionalDetails(!expandAdditionalDetails)}
                className="flex gap-2 items-center text-text-secondary cursor-pointer"
              >
                <span className="font-medium text-base">Additional details</span>
                <img
                  src="/arrow/chevron-right.svg"
                  alt="expand"
                  className={`w-5 h-5 transition-transform ${expandAdditionalDetails ? "rotate-90" : ""}`}
                />
              </button>

              {/* Additional Fields */}
              {expandAdditionalDetails && (
                <>
                  {/* Bill To Address Input */}
                  <InputOutlined label="Address" placeholder="Enter address" {...register("billToAddress")} />

                  {/* Bill To Tax ID Input */}
                  {/* <InputOutlined
                    label="Tax ID"
                    placeholder="Enter tax ID..."
                    {...register("billToTaxId")}
                  /> */}
                </>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-6 items-start w-full pb-32">
            {/* Title */}
            <div className="flex flex-col gap-2 items-start w-full">
              <h1 className="text-3xl font-medium leading-tight">Invoice details</h1>
            </div>

            {/* Invoice Details Section */}
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Invoice Number and Due Date */}
              <div className="flex gap-3 items-center w-full">
                <div className="flex-1">
                  <InputOutlined
                    label="Invoice number"
                    placeholder="Auto-generated"
                    disabled
                    {...register("invoiceNumber")}
                  />
                </div>
                {formData.paymentCollectionType === "one-time" && (
                  <div className="flex-1">
                    <DueDateDropdown selectedDate={formData.dueDate} onDateSelect={date => setValue("dueDate", date)} />
                  </div>
                )}
              </div>

              {/* Token Selection */}
              <InputOutlined
                label="Receive payment in"
                placeholder="Select token"
                value={formData.token?.symbol || ""}
                onChange={() => {}} // Read-only, click icon to select
                readOnly
                icon="/arrow/chevron-down.svg"
                iconOnClick={() => openModal("SELECT_TOKEN", { onTokenSelect: handleTokenSelect })}
              />

              <InputOutlined
                label="Network"
                placeholder="Select network"
                value={formData.network?.name || ""}
                onChange={() => {}} // Read-only, click icon to select
                readOnly
                icon="/arrow/chevron-down.svg"
                iconOnClick={() => openModal("SELECT_NETWORK", { onNetworkSelect: handleNetworkSelect })}
              />

              {/* Wallet Address */}
              <InputOutlined
                label="Wallet address to receive payment"
                placeholder="Enter wallet address"
                {...register("walletAddress")}
              />

              {/* Payment Collection Type */}
              <div className="flex flex-col gap-2 items-start w-full">
                <label className="text-sm font-medium text-text-secondary">Payment collection</label>
                <div className="flex gap-3 items-center w-full">
                  <button
                    onClick={() => setValue("paymentCollectionType", "one-time")}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                      formData.paymentCollectionType === "one-time"
                        ? "bg-black text-white"
                        : "border border-primary-divider text-black"
                    }`}
                  >
                    One-time
                  </button>

                  <button
                    className={`px-4 py-1.5 gap-2 flex justify-center items-center rounded-full font-semibold text-sm transition-colors cursor-not-allowed ${
                      formData.paymentCollectionType === "recurring"
                        ? "bg-black text-white"
                        : "border border-primary-divider text-black"
                    }`}
                    onClick={() => setValue("paymentCollectionType", "recurring")}
                    disabled
                  >
                    ️Recurring
                    <button
                      className="px-4 py-1 leading-none rounded-full font-semibold text-sm border text-[#007B4B]"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(113, 255, 146, 0.30) 30.1%, rgba(68, 153, 88, 0.30) 127.08%)",
                      }}
                    >
                      Coming soon
                    </button>
                  </button>
                </div>
              </div>

              {/* Recurring Payment Options */}
              {formData.paymentCollectionType === "recurring" && (
                <div className="flex flex-col items-start w-full">
                  {/* Recurring Interval and Start Date */}
                  <div className="flex gap-3 items-center w-full">
                    {/* Recurring Interval Dropdown */}
                    <div className="flex-1">
                      <RecurringIntervalDropdown
                        selectedInterval={formData.recurringInterval}
                        onIntervalSelect={interval => setValue("recurringInterval", interval)}
                      />
                    </div>

                    {/* Recurring Start Date */}
                    <div className="flex-1">
                      <DatePickerDropdown
                        label="Set the invoice to start at"
                        placeholder="Select date"
                        selectedDate={formData.recurringStartDate}
                        onDateSelect={date => setValue("recurringStartDate", date)}
                      />
                    </div>
                  </div>

                  {/* Info Hint */}
                  <div className="flex gap-2 items-center w-full px-4 py-3 ">
                    <img src="/misc/gray-info-icon.svg" alt="info" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-text-secondary">
                      Recurring interval would be same for each items.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[1px] w-full bg-primary-divider" />

            {/* Add Items Section */}
            <div className="flex flex-col gap-4 items-start w-full">
              <h2 className="text-xl font-semibold">Add items</h2>

              {/* Items List */}
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center w-full">
                  <InputOutlined
                    label="Item"
                    placeholder="Item name"
                    name="description"
                    value={item.description}
                    onChange={e => handleItemChange(index, "description", e.target.value)}
                    containerClassName="flex-1"
                  />
                  <InputOutlined
                    label="Price"
                    placeholder="0.00"
                    name="price"
                    type="number"
                    value={item.price}
                    onChange={e => handleItemChange(index, "price", e.target.value)}
                    containerClassName="w-40"
                  />
                  <InputOutlined
                    label="Qty"
                    placeholder="1"
                    name="qty"
                    type="number"
                    value={item.qty}
                    onChange={e => handleItemChange(index, "qty", e.target.value)}
                    containerClassName="w-20"
                  />
                  <InputOutlined
                    label="Amount"
                    placeholder="0.00"
                    name="amount"
                    type="number"
                    value={item.amount}
                    containerClassName="w-40"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="flex justify-center items-center w-40 border border-primary-divider rounded-[8px] text-text-secondary font-medium text-2xl hover:border-red-500 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    −
                  </button>
                </div>
              ))}

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
                className="w-full border border-primary-divider rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-primary-divider/10 transition-colors"
              >
                <img src="/misc/circle-plus-icon.svg" alt="add" className="w-5 h-5" />
                Add item
              </button>
            </div>

            {/* Note Section */}
            <div className="flex flex-col gap-2 items-start w-full">
              <label className="text-sm font-medium text-text-secondary">Note</label>
              <textarea
                placeholder="Add note"
                {...register("note")}
                className="w-full h-28 border border-primary-divider rounded-lg p-4 placeholder-text-secondary focus:outline-none focus:border-primary-blue"
              />
            </div>
          </div>
        );

      case 0:
        return (
          <div className="flex flex-col gap-3 items-start w-full">
            {/* Title */}
            <div className="flex flex-col gap-2 items-start w-full">
              <h1 className="text-3xl font-medium leading-tight">Payment details</h1>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-primary-divider" />

            {/* Payment Method Section */}
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Header */}
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold">Payment method</p>
                  <p className="text-xs font-medium text-text-secondary">
                    Choose account you want to receive your funds.
                  </p>
                </div>
              </div>

              {/* Payment Method Options */}
              <div className="flex flex-col gap-3 w-full">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setValue("paymentMethodId", method.id)}
                    className={`w-full flex gap-4 items-center px-4 py-3 rounded-2xl border transition-all border-primary-divider`}
                  >
                    {/* Radio Button */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-blue"
                      style={{
                        background: formData.paymentMethodId === method.id ? "var(--primary-blue)" : "white",
                        border: formData.paymentMethodId === method.id ? "none" : "2px solid var(--primary-divider)",
                      }}
                    >
                      {formData.paymentMethodId === method.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>

                    {/* Icon */}
                    {getMethodIcon(method.id)}

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <p className="text-base font-medium">{method.name}</p>
                      <p className="text-xs font-medium text-text-secondary">{method.balance}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-10 items-start w-full pb-32">
            {/* Header Section */}
            <div className="flex flex-col gap-3 items-start w-full">
              <p className="text-base font-semibold text-text-secondary">Send invoice for</p>
              <h1 className="text-4xl font-semibold leading-tight">
                <span className="text-primary-blue">
                  {total.toFixed(2)} {formData.token?.symbol || "USDT"}
                </span>
                {` to `}
                {formData.billToCompanyName || "recipient"}
              </h1>
              <p className="text-base font-medium text-text-secondary">
                Take one last look before sending. After you send the invoice, it can't be edited.
              </p>
            </div>

            {/* Email Fields */}
            <div className="flex flex-col gap-3 items-start w-full">
              {/* To Field */}
              <div className="w-full border border-primary-divider rounded-xl p-3 flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">To:</label>

                <div className="bg-primary-divider rounded-lg w-fit px-3 py-0.5">
                  <p className="text-base font-medium text-text-primary">
                    {formData.billToEmail || "recipient@example.com"}
                  </p>
                </div>
              </div>

              {/* CC Field */}
              <div className="w-full border border-primary-divider rounded-xl p-3 flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Cc:</label>

                {/* CC Email List */}
                <div className="flex items-center flex-row gap-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.billToCcEmails.map((email, index) => (
                      <div
                        key={index}
                        className="bg-primary-divider rounded-lg px-3 py-0.5 flex items-center gap-2 group"
                      >
                        <p className="text-base font-medium text-text-primary">{email}</p>
                        <button
                          onClick={() => handleRemoveCcEmail(index)}
                          className="text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 -mr-1"
                          title="Remove email"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* CC Input */}
                  <input
                    type="email"
                    placeholder={formData.billToCcEmails.length === 0 ? "Add CC mail" : "@mail.com"}
                    value={ccEmailInput}
                    onChange={e => setCcEmailInput(e.target.value)}
                    onKeyPress={handleCcEmailKeyPress}
                    onBlur={handleCcEmailBlur}
                    className="text-base placeholder-text-secondary w-fit outline-none"
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-text-secondary">Optional</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-6 items-start w-full">
            <h1 className="text-3xl font-medium leading-tight">Step {currentStep}</h1>
            <p className="text-text-secondary">Coming soon...</p>
          </div>
        );
    }
  };

  const InvoiceSuccessScreen = () => (
    <div className="flex flex-col gap-5 items-center justify-center w-full h-full overflow-y-auto">
      {/* Success Icon */}
      <img src="/modal/green-circle-check.gif" alt="success" className="w-16 h-16" />

      {/* Content */}
      <div className="flex flex-col gap-2 items-center justify-center w-full">
        {/* Title */}
        <h1 className="text-4xl font-semibold text-center">Invoice sent successfully</h1>

        {/* Description */}
        <div className="text-center text-text-secondary max-w-lg">
          <p className="text-base font-medium">
            Send invoice of{" "}
            <span className="font-bold text-text-primary">
              {total.toFixed(2)} {formData.token?.symbol || "USDT"}
            </span>
            {" has been sent to "}
            <span className="text-primary-blue">{formData.billToEmail}</span>
            {" successfully"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center w-full justify-center">
        {/* View Invoice Button */}
        <SecondaryButton
          text="View Invoice"
          variant="light"
          buttonClassName="w-[130px]"
          icon="/misc/eye-icon.svg"
          iconPosition="left"
          onClick={() => {
            openModal<InvoiceModalProps>("INVOICE_MODAL", {
              invoice: {
                amountDue: createdInvoice?.total!,
                billTo: {
                  address:
                    createdInvoice?.toCompanyAddress ||
                    [
                      createdInvoice?.toDetails?.address1,
                      createdInvoice?.toDetails?.address2,
                      createdInvoice?.toDetails?.city,
                      createdInvoice?.toDetails?.country,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  email: createdInvoice?.toCompanyEmail || createdInvoice?.emailTo,
                  name: createdInvoice?.toCompanyContactName || createdInvoice?.toCompanyName,
                  company: createdInvoice?.toCompanyName || "",
                },
                paymentToken: {
                  name: createdInvoice?.paymentToken?.symbol?.toUpperCase() || "USDT",
                },
                currency: createdInvoice?.currency || "USD",
                date: createdInvoice?.issueDate!,
                dueDate: createdInvoice?.dueDate!,
                from: {
                  name: createdInvoice?.fromDetails?.contactName || createdInvoice?.fromDetails?.companyName || "",
                  address: [
                    createdInvoice?.fromDetails?.address1,
                    createdInvoice?.fromDetails?.city,
                    createdInvoice?.fromDetails?.state,
                    createdInvoice?.fromDetails?.country,
                    createdInvoice?.fromDetails?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", "),
                  email: createdInvoice?.fromDetails?.email || "",
                  company: createdInvoice?.fromDetails?.companyName || "",
                },
                invoiceNumber: createdInvoice?.invoiceNumber!,
                items:
                  formData.items?.map((item: FormItem) => ({
                    name: item.description,
                    rate: parseFloat(item.price) || 0,
                    qty: parseFloat(item.qty) || 0,
                    amount: parseFloat(item.amount) || 0,
                  })) || [],
                subtotal: parseFloat(createdInvoice?.subtotal?.toString() || "0"),
                tax: 0,
                total: parseFloat(createdInvoice?.total?.toString() || "0"),
                walletAddress: createdInvoice?.paymentWalletAddress || createdInvoice?.walletAddress || "",
                network: createdInvoice?.paymentNetwork?.name || "Miden",
              },
            });
          }}
        />

        {/* Copy Link Button */}
        <PrimaryButton
          text="Copy Link"
          onClick={() => {
            if (createdInvoice?.uuid) {
              const invoiceUrl = `${window.location.origin}/invoice-review/b2b?id=${createdInvoice.uuid}`;
              navigator.clipboard.writeText(invoiceUrl);
            }
          }}
          iconPosition="left"
          icon="/misc/thin-copy-icon.svg"
          containerClassName="w-35"
        />
      </div>

      {/* Divider */}
      <div className="flex gap-3 items-center w-full max-w-sm justify-center">
        <div className="flex-1 h-px bg-primary-divider" />
        <span className="text-text-secondary font-medium">or</span>
        <div className="flex-1 h-px bg-primary-divider" />
      </div>

      {/* Go to Dashboard Button */}
      <button
        onClick={() => router.push("/invoice")}
        className="flex gap-2 items-center px-4 py-2.5 text-primary-blue font-medium text-sm hover:opacity-80 transition-opacity cursor-pointer"
      >
        <img src="/misc/blue-home-icon.svg" alt="back" className="w-5 h-5" />
        Go to dashboard
      </button>
    </div>
  );

  return (
    <>
      <div className="flex flex-row relative h-full bg-background">
        <div className="flex flex-col gap-6 items-start justify-start p-5 w-full h-full overflow-y-auto">
          {invoiceSent ? (
            <InvoiceSuccessScreen />
          ) : (
            <>
              <button
                onClick={() => router.push("/invoice")}
                className="flex gap-1 items-start text-[#066eff] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img src="/arrow/chevron-left.svg" alt="back" className="w-6 h-6" />
                <span className="font-medium text-base">Back to Dashboard</span>
              </button>

              {/* Step Indicator */}
              <StepIndicator />

              {/* Form Content */}
              <div key={currentStep} className="w-full">
                {renderStepContent()}
              </div>
            </>
          )}
        </div>

        <InvoicePreview
          invoiceNumber={createdInvoice?.invoiceNumber || formData.invoiceNumber || ""}
          date={formatDate(createdInvoice?.issueDate || formData.issueDate || "")}
          dueDate={formatDate(createdInvoice?.dueDate || formData.dueDate || "")}
          from={{
            name: formData.name || "",
            email: formData.email || "",
            company: formData.companyName || "",
            address: formData.address || "",
            token: formData.token?.symbol || "",
            network: formData.network?.name || "",
            walletAddress: formData.walletAddress || "",
          }}
          billTo={{
            name: formData.billToContactName || "",
            company: formData.billToCompanyName || "",
            email: formData.billToEmail || "",
            address: formData.billToAddress || "",
          }}
          items={formData.items.map(item => ({
            description: item.description,
            qty: parseInt(item.qty) || 0,
            price: parseFloat(item.price) || 0,
            amount: parseFloat(item.amount) || 0,
            currency: formData.currency || "USD",
          }))}
          note={formData.note || ""}
          subtotal={subtotal}
          total={total}
          amountDue={total}
          currency={formData.currency || "USD"}
          status={createdInvoice?.status || "DRAFT"}
        />

        {!invoiceSent && (
          <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/70 border-t border-primary-divider flex items-center justify-end px-10 py-4 z-10">
            {/* <SecondaryButton
            text={isLoading ? "Saving..." : "Save Draft"}
            onClick={handleSaveDraft}
            buttonClassName="w-auto px-4"
            variant="light"
            disabled={isLoading}
          /> */}
            <div className="flex gap-4 items-center">
              {currentStep > 1 && (
                <span className=" font-medium cursor-pointer" onClick={handleBack}>
                  Back
                </span>
              )}
              <PrimaryButton
                text={isLoading ? "Processing..." : currentStep === LAST_STEP ? "Send Invoice" : "Next"}
                onClick={handleNext}
                containerClassName="w-28"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateClientInvoice;
