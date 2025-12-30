"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CreateClientContactModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { Category, CategoryShape } from "@/types/address-book";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { CategoryDropdown } from "../../Common/Dropdown/CategoryDropdown";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import toast from "react-hot-toast";
import { useCreateClient } from "@/services/api/client";
import { CreateClientDto } from "@/types/client";
import { useAuth } from "@/services/auth/context";
import { CompanyTypeDropdown } from "@/components/Common/Dropdown/CompanyTypeDropdown";
import { CountryDropdown } from "@/components/Common/Dropdown/CountryDropdown";

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
    <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
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

export function CreateClientContactModal({ isOpen, onClose, zIndex }: ModalProp<CreateClientContactModalProps>) {
  const { isAuthenticated } = useAuth();
  const createClient = useCreateClient();
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      companyEmail: "",
      companyName: "",
      companyType: "",
      country: "",
      city: "",
      address1: "",
      address2: "",
      taxId: "",
      postalCode: "",
      registrationNumber: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const clientPayload: CreateClientDto = {
        email: data.companyEmail.trim(),
        companyName: data.companyName.trim(),
        companyType: selectedCompanyType || undefined,
        country: selectedCountry || undefined,
        city: data.city?.trim() || undefined,
        address1: data.address1?.trim() || undefined,
        address2: data.address2?.trim() || undefined,
        taxId: data.taxId?.trim() || undefined,
        postalCode: data.postalCode?.trim() || undefined,
        registrationNumber: data.registrationNumber?.trim() || undefined,
      };

      await createClient.mutateAsync(clientPayload);

      toast.success("Client created successfully");

      reset();
      setSelectedCompanyType("");
      setSelectedCountry("");
      onClose();
      closeModal("CHOOSE_CONTACT_TYPE");
    } catch (error) {
      console.error("Failed to create client:", error);
      toast.error("Failed to create client");
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedCompanyType("");
    setSelectedCountry("");
    onClose();
    closeModal("CHOOSE_CONTACT_TYPE");
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Add new client" icon="/misc/blue-user-hexagon-icon.svg" onClose={onClose} />
      <div className="bg-background border-2 border-primary-divider rounded-b-2xl w-[720px] p-5">
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            register={register("companyEmail", { required: "Email is required" })}
            error={errors.companyEmail?.message}
          />

          {/* Company Name */}
          <FormInput
            label="Company name"
            placeholder="Enter company name"
            register={register("companyName", { required: "Company name is required" })}
            error={errors.companyName?.message}
          />

          {/* Company Type and Country Row */}
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <CompanyTypeDropdown
                selectedCompanyType={selectedCompanyType}
                onCompanyTypeSelect={value => {
                  setSelectedCompanyType(value);
                  setValue("companyType", value);
                }}
                variant="filled"
              />
            </div>
            <div className="flex-1">
              <CountryDropdown
                selectedCountry={selectedCountry}
                onCountrySelect={value => {
                  setSelectedCountry(value);
                  setValue("country", value);
                }}
                variant="filled"
              />
            </div>
          </div>

          {/* City */}
          <FormInput label="City" placeholder="Enter city" register={register("city")} />

          {/* Address 1 */}
          <FormInput label="Address 1" placeholder="Enter address 1" register={register("address1")} />

          {/* Address 2 */}
          <FormInput label="Address 2 (optional)" placeholder="Enter address 2" register={register("address2")} />

          {/* Tax ID and Postal Code Row */}
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <FormInput label="Tax ID" placeholder="e.g. 123-45-6789" register={register("taxId")} />
            </div>
            <div className="flex-1">
              <FormInput label="Postal code" placeholder="e.g. 94103" register={register("postalCode")} />
            </div>
          </div>

          {/* Company Registration Number */}
          <FormInput
            label="Company registration number"
            placeholder="e.g. REG-12345"
            register={register("registrationNumber")}
          />

          <div className="flex gap-2 w-full">
            <SecondaryButton variant="light" text="Cancel" onClick={handleCancel} />
            <PrimaryButton text="Save changes" onClick={handleSubmit(onSubmit)} />
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

export default CreateClientContactModal;
