"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputOutlined from "@/components/Common/Input/InputOutlined";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import InvoicePreview from "../Common/Invoice/InvoicePreview";

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
  items: { description: string; price: string; qty: string; amount: string }[];
  note: string;
}

const CreateInvoice = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
    items: [],
    note: "",
  });

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
    }
  };

  const handleBack = () => {
    router.back();
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

  const StepIndicator = () => (
    <div className="flex gap-8 items-center justify-center w-full px-12">
      {[1, 2, 3, 4, 5].map(step => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
              step === currentStep
                ? "border-primary-blue text-primary-blue"
                : "border-primary-divider text-text-secondary"
            }`}
          >
            <span className="text-sm font-medium">{step}</span>
          </div>
          {step < 5 && <div className="flex-1 h-[1px] bg-primary-divider" />}
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
                className="flex gap-2 items-center text-text-secondary"
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
                className="flex gap-2 items-center text-text-secondary"
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
              <div className="flex gap-3 items-start w-full">
                <InputOutlined
                  label="Invoice number"
                  placeholder="INV0001"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  containerClassName="w-40"
                />
                <InputOutlined
                  label="Due date"
                  placeholder="Select date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  containerClassName="flex-1"
                />
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
                    disabled
                    className="px-4 py-1 leading-none rounded-full font-semibold text-sm border text-[#007B4B] opacity-50 cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(113, 255, 146, 0.30) 30.1%, rgba(68, 153, 88, 0.30) 127.08%)",
                    }}
                  >
                    Coming soon
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[2px] w-full bg-primary-divider" />

            {/* Add Items Section */}
            <div className="flex flex-col gap-4 items-start w-full">
              <h2 className="text-xl font-semibold">Add items</h2>

              {/* Items List */}
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end w-full">
                  <InputOutlined
                    label={index === 0 ? "Item" : ""}
                    placeholder="Item name"
                    name="description"
                    value={item.description}
                    onChange={e => handleItemChange(index, "description", e.target.value)}
                    containerClassName="flex-1"
                  />
                  <InputOutlined
                    label={index === 0 ? "Price" : ""}
                    placeholder="0.00"
                    name="price"
                    type="number"
                    value={item.price}
                    onChange={e => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                    containerClassName="w-40"
                  />
                  <InputOutlined
                    label={index === 0 ? "Qty" : ""}
                    placeholder="1"
                    name="qty"
                    type="number"
                    value={item.qty}
                    onChange={e => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                    containerClassName="w-20"
                  />
                  <InputOutlined
                    label={index === 0 ? "Amount" : ""}
                    placeholder="0.00"
                    name="amount"
                    type="number"
                    value={item.amount}
                    disabled
                    containerClassName="w-40"
                  />
                </div>
              ))}

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
                className="w-full border border-primary-divider rounded-lg py-3 text-primary-blue font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-divider/10 transition-colors"
              >
                <img src="/misc/plus-icon.svg" alt="add" className="w-5 h-5" />
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
      default:
        return (
          <div className="flex flex-col gap-6 items-start w-full">
            <h1 className="text-3xl font-medium leading-tight">Step {currentStep}</h1>
            <p className="text-text-secondary">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-row relative">
      <div className="flex flex-col gap-6 items-start justify-start p-5 w-full h-full overflow-y-auto">
        {/* Back Button */}
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
          <span className=" font-medium ">Back</span>
          <PrimaryButton text="Next" onClick={handleNext} disabled={currentStep === 5} containerClassName="w-24" />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
