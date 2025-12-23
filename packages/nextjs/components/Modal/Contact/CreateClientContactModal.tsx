"use client";
import React, { useMemo, useState } from "react";
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
import { AssetWithMetadata } from "@/types/faucet";
import toast from "react-hot-toast";
import { CompanyGroupResponseDto, CreateContactDto, NetworkDto, TokenDto, CategoryShapeEnum } from "@/types/employee";
import {
  useCheckEmployeeAddressDuplicate,
  useCheckEmployeeNameDuplicate,
  useCreateEmployee,
  useGetAllEmployeeGroups,
} from "@/services/api/employee";
import { EmployeeGroupDropdown } from "@/components/Common/Dropdown/EmployeeGroupDropdown";
import { useAuth } from "@/services/auth/context";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
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
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>({
    amount: "0",
    faucetId: QASH_TOKEN_ADDRESS,
    metadata: {
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY,
    },
  });
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>({
    icon: "/chain/miden.svg",
    name: "Miden Testnet",
    value: "miden",
  });
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroupResponseDto | undefined>(undefined);
  const { openModal } = useModal();
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const networkChainIds: Record<string, number> = useMemo(
    () => ({
      eth: 1,
      miden: 0,
      sol: 0,
      base: 8453,
      bnb: 56,
    }),
    [],
  );

  const { data: employeeGroups = [] } = useGetAllEmployeeGroups({ enabled: isAuthenticated });
  const createEmployee = useCreateEmployee();

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

  // const watchedName = watch("name");
  // const watchedAddress = watch("walletAddress");

  // const { data: nameDuplicate } = useCheckEmployeeNameDuplicate(watchedName, selectedGroup?.id ?? 0);
  // const { data: addressDuplicate } = useCheckEmployeeAddressDuplicate(watchedAddress, selectedGroup?.id ?? 0);

  // const groupIdRegister = register("groupId", {
  //   required: "Group is required",
  // });

  // const nameRegister = register("name", {
  //   required: "Name is required",
  //   minLength: {
  //     value: 1,
  //     message: "Name must be at least 1 character",
  //   },
  //   maxLength: {
  //     value: 100,
  //     message: "Name cannot exceed 100 characters",
  //   },
  //   pattern: {
  //     value: /^[a-zA-Z0-9\s\-_]+$/,
  //     message: "Name can only contain letters, numbers, spaces, hyphens, and underscores",
  //   },
  //   validate: () => {
  //     if (!selectedGroup) return true;
  //     if (nameDuplicate?.isDuplicate) return "This name already exists in the selected group";
  //     return true;
  //   },
  // });

  // const addressRegister = register("walletAddress", {
  //   required: "Wallet address is required",
  //   minLength: {
  //     value: 10,
  //     message: "Address is too short",
  //   },
  //   pattern: {
  //     value: /^mtst1[a-z0-9_]+$/i,
  //     message: "Address must start with 'mtst1' and contain only letters, numbers, and underscores",
  //   },
  //   validate: () => {
  //     if (!selectedGroup) return true;
  //     if (addressDuplicate?.isDuplicate) return "This address already exists in the selected group";
  //     return true;
  //   },
  // });

  // const emailRegister = register("email", {
  //   pattern: {
  //     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  //     message: "Email must be a valid email address",
  //   },
  //   maxLength: {
  //     value: 255,
  //     message: "Email cannot be longer than 255 characters",
  //   },
  //   validate: () => true,
  // });

  const onSubmit = async (data: any) => {
    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }

    if (!selectedNetwork) {
      toast.error("Please select a network");
      return;
    }

    try {
      const tokenPayload: TokenDto | undefined = selectedToken
        ? {
            address: selectedToken.faucetId,
            symbol: selectedToken.metadata.symbol,
            decimals: selectedToken.metadata.decimals,
            name: selectedToken.metadata.symbol,
          }
        : undefined;

      const networkPayload: NetworkDto = {
        name: selectedNetwork.name,
        chainId: networkChainIds[selectedNetwork.value] ?? 0,
      };

      const employeePayload: CreateContactDto = {
        groupId: selectedGroup.id,
        name: data.name.trim(),
        walletAddress: data.walletAddress.trim(),
        email: data.email?.trim() || undefined,
        token: tokenPayload,
        network: networkPayload,
      };

      await createEmployee.mutateAsync(employeePayload);

      toast.success("Contact created successfully");

      reset();
      setSelectedToken(null);
      setSelectedGroup(undefined);
      onClose();
    } catch (error) {
      console.error("Failed to create contact:", error);
      toast.error("Failed to create contact");
    }
  };

  const handleTokenSelect = (token: AssetWithMetadata | null) => {
    setSelectedToken(token);
  };

  const handleGroupSelect = (group: CompanyGroupResponseDto) => {
    setSelectedGroup(group);
    // setValue("groupId", group.id, { shouldValidate: true, shouldTouch: true });
  };

  const handleCancel = () => {
    reset();
    setSelectedToken(null);
    setSelectedGroup(undefined);
    setSelectedNetwork(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Add new client" icon="/misc/blue-user-hexagon-icon.svg" onClose={onClose} />
      <div className="bg-background border-2 border-primary-divider rounded-b-2xl w-[720px] p-5">
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
          {/* First and Last Name Row */}
          <FormInput label="Name" placeholder="Enter name" register={register("firstName", { required: true })} />

          {/* Company Name */}
          <FormInput label="Email" placeholder="Enter email" register={register("companyName", { required: true })} />

          {/* Company Name */}
          <FormInput
            label="Company name"
            placeholder="Enter company name"
            register={register("companyName", { required: true })}
          />

          <CompanyTypeDropdown
            selectedCompanyType={selectedCompanyType}
            onCompanyTypeSelect={value => {
              setSelectedCompanyType(value);
              setValue("companyType", value);
            }}
            variant="filled"
          />

          <CountryDropdown
            selectedCountry={selectedCountry}
            onCountrySelect={value => {
              setSelectedCountry(value);
              setValue("country", value);
            }}
            variant="filled"
          />

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

          {/* Address 1 */}
          <FormInput
            label="Address 1"
            placeholder="Enter address 1"
            register={register("address1", { required: true })}
          />

          {/* Address 2 */}
          <FormInput label="Address 2 (optional)" placeholder="Enter address 2" register={register("address2")} />

          {/* Postal Code and Registration Number Row */}
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <FormInput
                label="Postal code"
                placeholder="e.g. 70000"
                register={register("postalCode", { required: true })}
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Postal code"
                placeholder="e.g. 70000"
                register={register("postalCode", { required: true })}
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Company registration number"
                placeholder="e.g. 8683949"
                register={register("registrationNumber", { required: true })}
              />
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <SecondaryButton variant="light" text="Cancel" />
            <PrimaryButton text="Save changes" />
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

export default CreateClientContactModal;
