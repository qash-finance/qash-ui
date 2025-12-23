"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCreateCompany, CompanyTypeEnum } from "@/services/api/company";
import toast from "react-hot-toast";
import { useAuth } from "@/services/auth/context";
import { User } from "@/types/user";

type Step = "company" | "team" | "complete";

interface OnboardingFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  companyType: string;
  city: string;
  address1: string;
  address2: string;
  postalCode: string;
  registrationNumber: string;
}

// Map display names to enum values
const mapCompanyTypeToEnum = (displayName: string): CompanyTypeEnum => {
  const mapping: Record<string, CompanyTypeEnum> = {
    "Sole Proprietorship": CompanyTypeEnum.SOLE_PROPRIETORSHIP,
    Partnership: CompanyTypeEnum.PARTNERSHIP,
    "LLP – Limited Liability Partnership": CompanyTypeEnum.PARTNERSHIP,
    "LLC – Limited Liability Company": CompanyTypeEnum.LLC,
    "Private Limited Company (Ltd / Pte Ltd)": CompanyTypeEnum.CORPORATION,
    "Corporation (Inc. / Corp.)": CompanyTypeEnum.CORPORATION,
    "Public Limited Company (PLC)": CompanyTypeEnum.CORPORATION,
    "Non-Profit Organization": CompanyTypeEnum.OTHER,
  };
  return mapping[displayName] || CompanyTypeEnum.OTHER;
};

export default function OnboardingContainer() {
  const router = useRouter();
  const { isAuthenticated, accessToken, user, refreshUser } = useAuth();
  const createCompanyMutation = useCreateCompany();
  const [step, setStep] = useState<Step>("company");
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<OnboardingFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      country: "",
      companyType: "",
      city: "",
      address1: "",
      address2: "",
      postalCode: "",
      registrationNumber: "",
    },
  });

  // Redirect authenticated users away from onboarding
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasCompany = !!(user as User)?.teamMembership?.companyId || !!(user as User)?.teamMembership?.company;
    const destination = hasCompany ? "/bill" : "/onboarding";

    router.push(destination);
  }, [isAuthenticated, accessToken, user, router]);

  // Redirect unauthenticated users away from onboarding
  useEffect(() => {
    if (isAuthenticated) return;
    router.push("/login");
  }, [isAuthenticated, router]);

  const onSubmit = async (data: OnboardingFormData) => {
    if (!selectedCompanyType || !selectedCountry) {
      toast.error("Please select company type and country");
      return;
    }

    if (step === "company") {
      try {
        await createCompanyMutation.mutateAsync({
          companyOwnerFirstName: data.firstName,
          companyOwnerLastName: data.lastName,
          companyName: data.companyName,
          registrationNumber: data.registrationNumber,
          companyType: mapCompanyTypeToEnum(selectedCompanyType),
          country: selectedCountry,
          address1: data.address1,
          address2: data.address2 || undefined,
          city: data.city,
          postalCode: data.postalCode,
        });
        toast.success("Company registered successfully");
        // Refresh the user data to get updated company info
        await refreshUser?.();
        setStep("complete");
      } catch (error) {
        toast.error("Failed to create company");
      }
    } else if (step === "team") {
      // Team step logic can be added later
      setStep("complete");
    }
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
                  <InputOutlined
                    label="First name"
                    placeholder="Enter your first name"
                    {...register("firstName", { required: true })}
                  />
                </div>
                <div className="flex-1">
                  <InputOutlined
                    label="Last name"
                    placeholder="Enter your last name"
                    {...register("lastName", { required: true })}
                  />
                </div>
              </div>

              {/* Company Name */}
              <InputOutlined
                label="Company name"
                placeholder="Enter your company name"
                {...register("companyName", { required: true })}
              />

              <CompanyTypeDropdown
                selectedCompanyType={selectedCompanyType}
                onCompanyTypeSelect={value => {
                  setSelectedCompanyType(value);
                  setValue("companyType", value);
                }}
              />

              <CountryDropdown
                selectedCountry={selectedCountry}
                onCountrySelect={value => {
                  setSelectedCountry(value);
                  setValue("country", value);
                }}
              />

              {/* City */}
              <InputOutlined label="City" placeholder="Enter city" {...register("city", { required: true })} />

              {/* Address 1 */}
              <InputOutlined
                label="Address 1"
                placeholder="Enter address 1"
                {...register("address1", {
                  required: true,
                  minLength: {
                    value: 10,
                    message: "Address must be at least 10 characters",
                  },
                })}
              />

              {/* Address 2 */}
              <InputOutlined label="Address 2 (optional)" placeholder="Enter address 2" {...register("address2")} />

              {/* Postal Code and Registration Number Row */}
              <div className="flex gap-4 w-full">
                <div className="w-40">
                  <InputOutlined
                    label="Postal code"
                    placeholder="e.g. 70000"
                    {...register("postalCode", { required: true })}
                  />
                </div>
                <div className="flex-1">
                  <InputOutlined
                    label="Company registration number"
                    placeholder="e.g. 8683949"
                    {...register("registrationNumber", {
                      required: true,
                      minLength: {
                        value: 8,
                        message: "Registration number must be at least 8 characters",
                      },
                    })}
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
                <div className="flex gap-2 w-full" key={index}>
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
                onClick={() => {
                  router.push("/payroll");
                }}
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
            className="w-full flex items-center mt-5"
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
              onClick={handleSubmit(onSubmit)}
              loading={createCompanyMutation.isPending}
              disabled={!isValid || createCompanyMutation.isPending}
            />
          </div>
        )}
      </div>

      <Welcome />
    </div>
  );
}
