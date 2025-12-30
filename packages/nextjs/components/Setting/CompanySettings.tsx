"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/services/auth/context";
import InputOutlined from "../Common/Input/InputOutlined";
import { CompanyTypeDropdown } from "../Common/Dropdown/CompanyTypeDropdown";
import { CountryDropdown } from "../Common/Dropdown/CountryDropdown";
import { CompanyInfo } from "@/types/company";
import toast from "react-hot-toast";
import SettingHeader from "./SettingHeader";
import { useUpdateCompany } from "@/services/api/company";

interface CompanyFormData {
  companyName: string;
  companyType: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
  taxId: string;
  postalCode: string;
  registrationNumber: string;
}

export default function CompanySettings() {
  const { user } = useAuth();
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<CompanyFormData>({
    defaultValues: {
      companyName: "",
      companyType: "",
      country: "",
      state: "",
      city: "",
      address1: "",
      address2: "",
      taxId: "",
      postalCode: "",
      registrationNumber: "",
    },
  });

  // Load company data from user context
  useEffect(() => {
    if (user?.teamMembership?.company) {
      const company = user.teamMembership.company as CompanyInfo;
      reset({
        companyName: company.companyName || "",
        companyType: company.companyType || "",
        country: company.country || "",
        state: "",
        city: company.city || "",
        address1: company.address1 || "",
        address2: company.address2 || "",
        taxId: company.taxId || "",
        postalCode: company.postalCode || "",
        registrationNumber: company.registrationNumber || "",
      });
      setSelectedCompanyType(company.companyType || "");
      setSelectedCountry(company.country || "");
    }
  }, [user, reset]);

  // Track changes
  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      updateCompany(
        {
          companyName: data.companyName,
          companyType: data.companyType as any,
          country: data.country,
          address1: data.address1,
          address2: data.address2 || undefined,
          city: data.city,
          postalCode: data.postalCode,
        },
        {
          onSuccess: () => {
            toast.success("Company settings updated successfully");
            setHasChanges(false);
          },
          onError: (error: any) => {
            const errorMessage = error?.message || "Failed to update company settings";
            toast.error(errorMessage);
          },
        },
      );
    } catch (error) {
      toast.error("Failed to update company settings");
    }
  };

  return (
    <div className="flex flex-col">
      <SettingHeader
        icon="/misc/company-icon.svg"
        title="Company"
        buttonText="Save Changes"
        onButtonClick={handleSubmit(onSubmit)}
        buttonDisabled={!hasChanges || isUpdating}
        buttonClassName="w-30"
      />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0">
        {/* First Section */}
        <div className="flex flex-col gap-3 pb-6 border-b border-primary-divider">
          {/* Company Name */}
          <InputOutlined
            label="Company name"
            placeholder="Enter your company name"
            {...register("companyName", { required: true })}
          />

          {/* Company Type Dropdown */}
          <CompanyTypeDropdown
            selectedCompanyType={selectedCompanyType}
            onCompanyTypeSelect={value => {
              setSelectedCompanyType(value);
              setValue("companyType", value, { shouldDirty: true });
            }}
          />

          {/* Country Dropdown */}
          <CountryDropdown
            selectedCountry={selectedCountry}
            onCountrySelect={value => {
              setSelectedCountry(value);
              setValue("country", value, { shouldDirty: true });
            }}
          />

          {/* State and City Row */}
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <InputOutlined label="State" placeholder="Select state" {...register("state")} />
            </div>
            <div className="flex-1">
              <InputOutlined label="City" placeholder="Select city" {...register("city")} />
            </div>
          </div>

          {/* Address 1 */}
          <InputOutlined label="Address 1" placeholder="Enter address 1" {...register("address1")} />

          {/* Address 2 */}
          <InputOutlined label="Address 2" placeholder="Enter address 2" {...register("address2")} />
        </div>

        {/* Second Section */}
        <div className="flex flex-col gap-3 pt-6">
          {/* Tax ID */}
          <InputOutlined label="Tax ID" placeholder="Enter tax ID" {...register("taxId")} />

          {/* Postal Code */}
          <InputOutlined label="Postal code" placeholder="e.g. 70000" {...register("postalCode")} />

          {/* Company Registration Number */}
          <InputOutlined
            label="Company registration number"
            placeholder="e.g. 8683949"
            {...register("registrationNumber")}
          />
        </div>
      </form>
    </div>
  );
}
