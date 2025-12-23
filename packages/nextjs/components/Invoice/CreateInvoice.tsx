"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputOutlined from "@/components/Common/Input/InputOutlined";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";

interface FormData {
  name: string;
  companyName: string;
  email: string;
  address: string;
  taxId: string;
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

  return (
    <div className="flex flex-col gap-6 items-start justify-start pb-10 pt-4 px-10 w-full h-full overflow-y-auto">
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
      <div className="flex flex-col gap-6 items-start w-full">
        {/* Title */}
        <div className="flex flex-col gap-2 items-start w-full">
          <h1 className="text-white text-3xl font-medium leading-tight">Check your information</h1>
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
              src="/arrow/chevron-down.svg"
              alt="expand"
              className={`w-5 h-5 transition-transform ${expandAdditionalDetails ? "rotate-180" : ""}`}
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
    </div>
  );
};

export default CreateInvoice;
