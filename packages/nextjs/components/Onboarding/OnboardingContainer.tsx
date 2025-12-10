"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Welcome from "../Common/Welcome";
import { PrimaryButton } from "../Common/PrimaryButton";
import InputOutlined from "../Common/Input/InputOutlined";
import { Select } from "../Common/Select";
import { CategoryDropdown } from "../Common/Dropdown/CategoryDropdown";
import { CompanyTypeDropdown } from "../Common/Dropdown/CompanyTypeDropdown";
import { CountryDropdown } from "../Common/Dropdown/CountryDropdown";
import { SecondaryButton } from "../Common/SecondaryButton";
import { FileUpload } from "./FileUpload";

type Step = "company" | "team" | "complete";

interface OnboardingFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  companyType: string;
  address1: string;
  address2: string;
  postalCode: string;
  registrationNumber: string;
}

export default function OnboardingContainer() {
  const [step, setStep] = useState<Step>("company");
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const { register, handleSubmit, watch } = useForm<OnboardingFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      country: "",
      companyType: "",
      address1: "",
      address2: "",
      postalCode: "",
      registrationNumber: "",
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    console.log("Form submitted:", data);
    // Continue logic here
  };

  const renderStep = () => {
    switch (step) {
      case "company":
        return (
          <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            {/* Title */}
            <h1 className="text-[32px] font-medium text-text-primary tracking-tight">Tell us about your company</h1>

            {/* Form Fields */}
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
              {/* First and Last Name Row */}
              <div className="flex gap-4 w-full">
                <div className="flex-1">
                  <InputOutlined label="First name" placeholder="Enter your first name" {...register("firstName")} />
                </div>
                <div className="flex-1">
                  <InputOutlined label="Last name" placeholder="Enter your last name" {...register("lastName")} />
                </div>
              </div>

              {/* Company Name */}
              <InputOutlined label="Company name" placeholder="Enter your company name" {...register("companyName")} />

              <CompanyTypeDropdown
                selectedCompanyType={selectedCompanyType}
                onCompanyTypeSelect={setSelectedCompanyType}
              />

              <CountryDropdown selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />

              {/* Address 1 */}
              <InputOutlined label="Address 1" placeholder="Enter address 1" {...register("address1")} />

              {/* Address 2 */}
              <InputOutlined label="Address 2" placeholder="Enter address 2" {...register("address2")} />

              {/* Postal Code and Registration Number Row */}
              <div className="flex gap-4 w-full">
                <div className="w-40">
                  <InputOutlined label="Postal code" placeholder="e.g. 70000" {...register("postalCode")} />
                </div>
                <div className="flex-1">
                  <InputOutlined
                    label="Company registration number"
                    placeholder="e.g. 8683949"
                    {...register("registrationNumber")}
                  />
                </div>
              </div>
            </form>
          </div>
        );
      case "team":
        return (
          <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            {/* Title */}
            <h1 className="text-[32px] font-medium text-text-primary tracking-tight">Add your Team</h1>
            {/* Form Fields */}
            <div className="flex flex-col gap-4 w-full">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="flex gap-2 w-full">
                  <InputOutlined label={`Member ${index + 1}`} placeholder="Enter name" {...register("firstName")} />
                  <InputOutlined label="Email" placeholder="@mail" {...register("lastName")} />
                </div>
              ))}
            </div>
            <span className="text-text-secondary text-[16px] w-[450px]">
              or you can upload a spreadsheet — our AI will automatically fill in your team details for you.
            </span>
            <FileUpload
              onFileSelect={files => {
                console.log("Files selected:", files);
                // Handle file upload logic here
              }}
            />
          </div>
        );
      case "complete":
        return (
          <div className="flex justify-center items-center flex-col h-[530px] rounded-3xl border border-primary-divider relative overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full z-0"
              style={{
                background: "url('/onboarding/complete-background.svg')",
                backgroundSize: "cover",
                filter: "blur(12px)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <img src="/onboarding/hexagon-avatar.svg" alt="Onboarding Complete" className="w-[220px] h-[220px]" />
              <span className="font-bold text-2xl">Congratulations</span>
              <span className="text-lg text-text-secondary">Your new account is ready to accept payments</span>
              <PrimaryButton
                text="Go to app"
                containerClassName="w-[180px] mt-6"
                onClick={() => {}}
                icon="/arrow/chevron-right-light.svg"
                iconPosition="right"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-row w-full h-full p-5 bg-background">
      <div className="flex flex-col items-start w-1/2 p-[60px] h-full justify-between">
        {/* Header with progress and skip button */}

        <div className="w-full flex flex-col h-full">
          <div className="flex gap-[19px] items-center w-full mb-8">
            <div className="flex gap-[4px] items-start flex-1">
              <div
                className={`h-1 rounded transition-all duration-500 ease-out ${
                  step === "company" ? "w-7 bg-primary-blue" : "w-2.5 bg-[#D7D7D7]"
                }`}
              />
              <div
                className={`h-1 rounded transition-all duration-500 ease-out ${
                  step === "team" ? "w-7 bg-primary-blue" : "w-2.5 bg-[#D7D7D7]"
                }`}
              />
              <div
                className={`h-1 rounded transition-all duration-500 ease-out ${
                  step === "complete" ? "w-7 bg-primary-blue" : "w-2.5 bg-[#D7D7D7]"
                }`}
              />
            </div>
          </div>

          {renderStep()}
        </div>

        {step !== "complete" && (
          <div
            className="w-full flex  items-center "
            style={{
              justifyContent: step === "company" ? "flex-end" : "space-between",
            }}
          >
            {step === "team" && (
              <SecondaryButton
                text="Go Back"
                variant="light"
                buttonClassName="w-[100px]"
                onClick={() => setStep("company")}
              />
            )}
            <PrimaryButton
              text="Continue"
              containerClassName="w-[140px]"
              icon="/arrow/chevron-right-light.svg"
              iconPosition="right"
              onClick={() => {
                if (step === "company") {
                  setStep("team");
                  return;
                }

                if (step === "team") {
                  setStep("complete");
                  return;
                }
              }}
            />
          </div>
        )}
      </div>

      <Welcome />
    </div>
  );
}
