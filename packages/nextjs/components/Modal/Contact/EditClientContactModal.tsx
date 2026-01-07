"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditClientContactModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import toast from "react-hot-toast";
import { useUpdateClient } from "@/services/api/client";
import { UpdateClientDto } from "@/types/client";
import { ClientResponseDto } from "@/types/client";
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

export function EditClientContactModal({
  isOpen,
  onClose,
  zIndex,
  clientData,
}: ModalProp<EditClientContactModalProps>) {
  const { isAuthenticated } = useAuth();
  const updateClient = useUpdateClient();
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>(clientData?.companyType || "");
  const [selectedCountry, setSelectedCountry] = useState<string>(clientData?.country || "");
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
      companyEmail: clientData?.email || "",
      companyName: clientData?.companyName || "",
      companyType: clientData?.companyType || "",
      country: clientData?.country || "",
      city: clientData?.city || "",
      address1: clientData?.address1 || "",
      address2: clientData?.address2 || "",
      taxId: clientData?.taxId || "",
      postalCode: clientData?.postalCode || "",
      registrationNumber: clientData?.registrationNumber || "",
    },
  });

  // Update form values when clientData changes
  useEffect(() => {
    if (clientData) {
      reset({
        companyEmail: clientData.email || "",
        companyName: clientData.companyName || "",
        companyType: clientData.companyType || "",
        country: clientData.country || "",
        city: clientData.city || "",
        address1: clientData.address1 || "",
        address2: clientData.address2 || "",
        taxId: clientData.taxId || "",
        postalCode: clientData.postalCode || "",
        registrationNumber: clientData.registrationNumber || "",
      });
      setSelectedCompanyType(clientData.companyType || "");
      setSelectedCountry(clientData.country || "");
    }
  }, [clientData]);

  const onSubmit = async (data: any) => {
    if (!clientData?.uuid) {
      toast.error("Client ID not found");
      return;
    }

    try {
      const clientPayload: UpdateClientDto = {
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

      await updateClient.mutateAsync({
        uuid: clientData.uuid,
        data: clientPayload,
      });

      toast.success("Client updated successfully");

      reset();
      setSelectedCompanyType("");
      setSelectedCountry("");
      onClose();
    } catch (error: any) {
      // Use user-friendly error message from API client
      const errorMessage = error.userMessage || error.message || "An unexpected error occurred";
      toast.error(errorMessage);
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
      <ModalHeader title="Edit client" icon="/misc/blue-user-hexagon-icon.svg" onClose={onClose} />
      <div className="bg-background border-2 border-primary-divider rounded-b-2xl w-[720px] p-5">
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            register={register("companyEmail", {
              required: "Email is required",
              pattern: {
                value:
                  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                message: "Email must be a valid email address",
              },
              maxLength: { value: 255, message: "Email cannot be longer than 255 characters" },
            })}
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

export default EditClientContactModal;
