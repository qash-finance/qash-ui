"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputOutlined from "@/components/Common/Input/InputOutlined";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { RecurringIntervalDropdown } from "@/components/Common/Dropdown/RecurringIntervalDropdown";
import { DatePickerDropdown } from "@/components/Common/Dropdown/DatePickerDropdown";
import { DueDateDropdown } from "@/components/Common/Dropdown/DueDateDropdown";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { set } from "lodash";
import { useModal } from "@/contexts/ModalManagerProvider";

interface PaymentMethod {
  id: string;
  name: string;
  balance: string;
  color: string;
  icon?: string;
}

interface FormData {
  name: string;
  companyName: string;
  email: string;
  address: string;
  taxId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billToName: string;
  billToEmail: string;
  billToAddress: string;
  token: string;
  network: string;
  walletAddress: string;
  amountDue: number;
  currency: string;
  status: string;
  paymentCollectionType: "one-time" | "recurring";
  recurringInterval: string;
  recurringStartDate: string;
  items: { description: string; price: string; qty: string; amount: string }[];
  note: string;
  paymentMethodId: string;
}

const CreateClientInvoice = () => {
  const { openModal } = useModal();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [expandAdditionalDetails, setExpandAdditionalDetails] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    companyName: "",
    email: "",
    address: "",
    taxId: "",
    invoiceNumber: "",
    date: "",
    dueDate: "",
    billToName: "",
    billToEmail: "",
    billToAddress: "",
    token: "USDT",
    network: "",
    walletAddress: "",
    amountDue: 0,
    currency: "",
    status: "",
    paymentCollectionType: "one-time",
    recurringInterval: "Monthly",
    recurringStartDate: "",
    items: [],
    note: "",
    paymentMethodId: "payroll",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log("Saving draft:", formData);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      // Send invoice and show success screen
      setInvoiceSent(true);
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
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", price: "", qty: "1", amount: "" }],
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] } as any;
      item[field] = value;

      // Calculate amount if price or qty changes
      if (field === "price" || field === "qty") {
        item.amount = (item.price || 0) * (item.qty || 0);
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const StepIndicator = () => (
    <div className="flex gap-8 items-center justify-center w-full px-12">
      {[1, 2, 3, 4, 5].map(step => (
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
          {step < 5 && (
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
              <InputOutlined
                label="Name"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />

              {/* Company Name Input */}
              <InputOutlined
                label="Company name"
                placeholder="Enter your company name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
              />

              {/* Email Input */}
              <InputOutlined
                label="Email"
                placeholder="qashcompany@gmail.com"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
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
                  {/* Address Input */}
                  <InputOutlined
                    label="Address"
                    placeholder="Enter address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />

                  {/* Tax ID Input */}
                  <InputOutlined
                    label="Tax ID"
                    placeholder="Enter tax ID..."
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                  />
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
              {/* Bill To Company Name Input */}
              <InputOutlined
                label="Company name"
                placeholder="Enter company name"
                name="billToName"
                value={formData.billToName}
                onChange={handleInputChange}
              />

              {/* Bill To Email Input */}
              <InputOutlined
                label="Email"
                placeholder="qashcompany@gmail.com"
                name="billToEmail"
                type="email"
                value={formData.billToEmail}
                onChange={handleInputChange}
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
                  {/* Bill To Name Input */}
                  <InputOutlined
                    label="Name"
                    placeholder="Enter name"
                    name="billToName"
                    value={formData.billToName}
                    onChange={handleInputChange}
                    icon="/misc/address-book-icon.svg"
                    iconOnClick={() => openModal("SELECT_CLIENT")}
                  />

                  {/* Bill To Address Input */}
                  <InputOutlined
                    label="Address"
                    placeholder="Enter address"
                    name="billToAddress"
                    value={formData.billToAddress}
                    onChange={handleInputChange}
                  />

                  {/* Bill To Address Input */}
                  <InputOutlined
                    label="Tax ID"
                    placeholder="Enter tax ID..."
                    name="billToTaxId"
                    // value={formData.billToTaxId}
                    onChange={handleInputChange}
                  />
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
                    placeholder="INV0001"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                  />
                </div>
                {formData.paymentCollectionType === "one-time" && (
                  <div className="flex-1">
                    <DueDateDropdown
                      selectedDate={formData.dueDate}
                      onDateSelect={date =>
                        setFormData(prev => ({
                          ...prev,
                          dueDate: date,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Token Selection */}
              <InputOutlined
                label="Receive payment in"
                placeholder="USDT"
                name="token"
                value={formData.token}
                onChange={handleInputChange}
              />

              {/* Payment Collection Type */}
              <div className="flex flex-col gap-2 items-start w-full">
                <label className="text-sm font-medium text-text-secondary">Payment collection</label>
                <div className="flex gap-3 items-center w-full">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, paymentCollectionType: "one-time" }))}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                      formData.paymentCollectionType === "one-time"
                        ? "bg-black text-white"
                        : "border border-primary-divider text-black"
                    }`}
                  >
                    One-time
                  </button>

                  <button
                    className={`px-4 py-1.5 gap-2 flex justify-center items-center rounded-full font-semibold text-sm transition-colors ${
                      formData.paymentCollectionType === "recurring"
                        ? "bg-black text-white"
                        : "border border-primary-divider text-black"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentCollectionType: "recurring" }))}
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
                        onIntervalSelect={interval =>
                          setFormData(prev => ({
                            ...prev,
                            recurringInterval: interval,
                          }))
                        }
                      />
                    </div>

                    {/* Recurring Start Date */}
                    <div className="flex-1">
                      <DatePickerDropdown
                        label="Set the invoice to start at"
                        placeholder="Select date"
                        selectedDate={formData.recurringStartDate}
                        onDateSelect={date =>
                          setFormData(prev => ({
                            ...prev,
                            recurringStartDate: date,
                          }))
                        }
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
                    onChange={e => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                    containerClassName="w-40"
                  />
                  <InputOutlined
                    label="Qty"
                    placeholder="1"
                    name="qty"
                    type="number"
                    value={item.qty}
                    onChange={e => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
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
                value={formData.note}
                onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full h-28 border border-primary-divider rounded-lg p-4 bg-transparent text-white placeholder-text-secondary focus:outline-none focus:border-primary-blue"
              />
            </div>
          </div>
        );

      case 4:
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
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethodId: method.id }))}
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

      case 5:
        return (
          <div className="flex flex-col gap-10 items-start w-full pb-32">
            {/* Header Section */}
            <div className="flex flex-col gap-3 items-start w-full">
              <p className="text-base font-semibold text-text-secondary">Send invoice for</p>
              <h1 className="text-4xl font-semibold leading-tight">
                <span className="text-primary-blue">
                  {formData.items
                    .reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.qty) || 0), 0)
                    .toFixed(2)}{" "}
                  {formData.token}
                </span>
                {` to `}
                {formData.billToName || "recipient"}
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

                <div className="bg-primary-divider rounded-lg w-fit px-3 py-0.5">
                  <p className="text-base font-medium text-text-primary">
                    {formData.billToEmail || "recipient@example.com"}
                  </p>
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
              {formData.items
                .reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.qty) || 0), 0)
                .toFixed(2)}{" "}
              {formData.token}
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
          onClick={() => {}}
          buttonClassName="w-auto px-4"
          variant="light"
          iconPosition="left"
          icon="/misc/eye-icon.svg"
        />

        {/* Copy Link Button */}
        <PrimaryButton
          text="Copy Link"
          onClick={() => {}}
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
        onClick={() => router.push("/dashboard")}
        className="flex gap-2 items-center px-4 py-2.5 text-primary-blue font-medium text-sm hover:opacity-80 transition-opacity"
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
                onClick={handleBack}
                className="flex gap-1 items-start text-[#066eff] hover:opacity-80 transition-opacity"
              >
                <img src="/arrow/chevron-left.svg" alt="back" className="w-6 h-6" />
                <span className="font-medium text-base">Back to Dashboard</span>
              </button>

              {/* Step Indicator */}
              <StepIndicator />

              {/* Form Content */}
              {renderStepContent()}
            </>
          )}
        </div>

        <InvoicePreview
          invoiceNumber={formData.invoiceNumber || ""}
          date={formData.date || ""}
          dueDate={formData.dueDate || ""}
          from={{
            name: formData.name || "",
            email: formData.email || "",
            company: formData.companyName || "",
            address: formData.address || "",
            token: formData.token || "",
            network: formData.network || "",
            walletAddress: formData.walletAddress || "",
          }}
          billTo={{
            name: formData.billToName || "",
            company: formData.companyName || "",
            email: formData.billToEmail || "",
            address: formData.billToAddress || "",
          }}
          items={[]}
          subtotal={0}
          total={0}
          amountDue={formData.amountDue || 0}
          currency={formData.currency || ""}
          status={formData.status || ""}
        />

        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/70 border-t border-primary-divider flex items-center justify-between px-10 py-4">
          <SecondaryButton text="Save Draft" onClick={handleSaveDraft} buttonClassName="w-auto px-4" variant="light" />
          <div className="flex gap-4 items-center">
            <span className=" font-medium cursor-pointer" onClick={handleBack}>
              Back
            </span>
            <PrimaryButton
              text={currentStep === 5 ? "Send Invoice" : "Next"}
              onClick={handleNext}
              containerClassName="w-28"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateClientInvoice;
