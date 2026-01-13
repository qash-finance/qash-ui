"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateEmployeeContactModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { CategoryDropdown } from "../../Common/Dropdown/CategoryDropdown";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { AssetWithMetadata } from "@/types/faucet";
import toast from "react-hot-toast";
import { CompanyGroupResponseDto, CreateContactDto, NetworkDto, TokenDto } from "@/types/employee";
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
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";

interface CreateContactFormData {
  name: string;
  walletAddress: string;
  email: string;
  groupId?: number;
}

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
        <label className="text-text-secondary text-sm font-medium">
          {label} {!required && <span className="text-text-secondary">(Optional)</span>}
        </label>
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

const DEFAULT_TOKEN: AssetWithMetadata = {
  amount: "0",
  faucetId: QASH_TOKEN_ADDRESS,
  metadata: {
    symbol: QASH_TOKEN_SYMBOL,
    decimals: QASH_TOKEN_DECIMALS,
    maxSupply: QASH_TOKEN_MAX_SUPPLY,
  },
};

const DEFAULT_NETWORK: { icon: string; name: string; value: string } = {
  icon: "/chain/miden.svg",
  name: "Miden Testnet",
  value: "miden",
};

export function CreateEmployeeContactModal({ isOpen, onClose, zIndex }: ModalProp<CreateEmployeeContactModalProps>) {
  const { isAuthenticated } = useAuth();
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(DEFAULT_TOKEN);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(
    DEFAULT_NETWORK,
  );
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroupResponseDto | undefined>(undefined);
  const { openModal, closeModal } = useModal();

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
  } = useForm<CreateContactFormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      walletAddress: "",
      email: "",
      groupId: undefined,
    },
  });

  const watchedName = watch("name");
  const watchedAddress = watch("walletAddress");

  const { data: nameDuplicate } = useCheckEmployeeNameDuplicate(watchedName, selectedGroup?.id ?? 0);
  const { data: addressDuplicate } = useCheckEmployeeAddressDuplicate(watchedAddress, selectedGroup?.id ?? 0);

  // Reset to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedToken(DEFAULT_TOKEN);
      setSelectedNetwork(DEFAULT_NETWORK);
      setSelectedGroup(undefined);
      reset({
        name: "",
        walletAddress: "",
        email: "",
        groupId: undefined,
      });
    }
  }, [isOpen, reset]);

  const groupIdRegister = register("groupId", {
    required: "Group is required",
  });

  const nameRegister = register("name", {
    required: "Name is required",
    minLength: {
      value: 1,
      message: "Name must be at least 1 character",
    },
    maxLength: {
      value: 100,
      message: "Name cannot exceed 100 characters",
    },
    pattern: {
      value: /^[a-zA-Z0-9\s\-_]+$/,
      message: "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    },
    validate: () => {
      if (!selectedGroup) return true;
      if (nameDuplicate?.isDuplicate) return "This name already exists in the selected group";
      return true;
    },
  });

  const addressRegister = register("walletAddress", {
    required: "Wallet address is required",
    minLength: {
      value: 10,
      message: "Address is too short",
    },
    pattern: {
      value: /^mtst1[a-z0-9_]+$/i,
      message: "Address must start with 'mtst1' and contain only letters, numbers, and underscores",
    },
    validate: () => {
      if (!selectedGroup) return true;
      if (addressDuplicate?.isDuplicate) return "This address already exists in the selected group";
      return true;
    },
  });

  const emailRegister = register("email", {
    required: "Email is required",
    pattern: {
      // User-provided RFC-like email regex (escaped '/' for JS regex literal)
      value:
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      message: "Email must be a valid email address",
    },
    maxLength: {
      value: 255,
      message: "Email cannot be longer than 255 characters",
    },
  });

  const onSubmit = async (data: CreateContactFormData) => {
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
      setSelectedToken(DEFAULT_TOKEN);
      setSelectedNetwork(DEFAULT_NETWORK);
      setSelectedGroup(undefined);
      onClose();
      closeModal("CHOOSE_CONTACT_TYPE");
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
    setValue("groupId", group.id, { shouldValidate: true, shouldTouch: true });
  };

  const handleCancel = () => {
    reset();
    setSelectedToken(DEFAULT_TOKEN);
    setSelectedNetwork(DEFAULT_NETWORK);
    setSelectedGroup(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Add new contact" icon="/misc/blue-user-hexagon-icon.svg" onClose={onClose} />
      <div className="bg-background border-2 border-primary-divider rounded-b-2xl w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
          <FormInput
            label="Name"
            placeholder="Enter contact name"
            register={nameRegister}
            error={errors.name?.message}
            disabled={createEmployee.isPending}
            required
          />

          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            register={emailRegister}
            error={errors.email?.message}
            disabled={createEmployee.isPending}
            required
          />

          <FormInput
            label="Wallet address"
            placeholder="Enter wallet address"
            register={addressRegister}
            error={errors.walletAddress?.message}
            disabled={createEmployee.isPending}
            required
          />

          <input type="hidden" {...groupIdRegister} value={selectedGroup?.id ?? ""} />

          {/* Network Selection */}
          <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
            <button
              type="button"
              onClick={() => openModal(MODAL_IDS.SELECT_NETWORK, { onNetworkSelect: setSelectedNetwork })}
              className="flex items-center gap-2 px-4 py-2 h-full w-full text-left cursor-pointer"
              disabled={createEmployee.isPending}
            >
              {selectedNetwork && <img src={selectedNetwork.icon} alt="network" className="w-8 h-8" />}
              <div className="flex-1">
                <p className="text-text-secondary text-sm leading-none">Select network</p>
                <p className="text-text-primary text-base font-medium">{selectedNetwork?.name || "-"}</p>
              </div>
              <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-6 h-6" />
            </button>
          </div>

          {/* Token Selection */}
          <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
            <button
              type="button"
              onClick={() => openModal(MODAL_IDS.SELECT_TOKEN, { onTokenSelect: handleTokenSelect })}
              className="flex items-center gap-2 px-4 py-2 h-full w-full text-left cursor-pointer"
              disabled={createEmployee.isPending}
            >
              {selectedToken && (
                <img
                  src={
                    selectedToken.metadata.symbol === "QASH"
                      ? "/q3x-icon.png"
                      : blo(turnBechToHex(selectedToken.faucetId))
                  }
                  alt="token"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="text-text-secondary text-sm leading-none">Select token</p>
                <p className="text-text-primary text-base font-medium">{selectedToken?.metadata.symbol || "-"}</p>
              </div>
              <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-6 h-6" />
            </button>
          </div>

          {/* Category Selection */}
          <div className="bg-app-background rounded-xl border-b-2 border-primary-divider py-2">
            <EmployeeGroupDropdown
              groups={employeeGroups}
              selectedGroup={selectedGroup}
              onGroupSelect={handleGroupSelect}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3">
            <SecondaryButton
              text="Cancel"
              onClick={handleCancel}
              buttonClassName="flex-1"
              disabled={createEmployee.isPending}
              variant="light"
            />
            <PrimaryButton
              text="Confirm"
              onClick={handleSubmit(onSubmit)}
              containerClassName="flex-1"
              disabled={!selectedGroup || !isValid}
              loading={createEmployee.isPending}
            />
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

export default CreateEmployeeContactModal;
