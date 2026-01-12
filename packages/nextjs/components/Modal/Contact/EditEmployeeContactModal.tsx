"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { EditEmployeeContactModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { UpdateAddressBookDto, CompanyGroupResponseDto, TokenDto, NetworkDto } from "@/types/employee";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import {
  useUpdateEmployee,
  useGetAllEmployeeGroups,
  useCheckEmployeeNameDuplicate,
  useCheckEmployeeAddressDuplicate,
} from "@/services/api/employee";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { AssetWithMetadata } from "@/types/faucet";
import toast from "react-hot-toast";
import { EmployeeGroupDropdown } from "@/components/Common/Dropdown/EmployeeGroupDropdown";
import { useAuth } from "@/services/auth/context";

interface EditContactFormData {
  name: string;
  walletAddress: string;
  email?: string;
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

// Helper function to map network name to icon and value
const getNetworkFromName = (networkName?: string): { icon: string; name: string; value: string } | null => {
  if (!networkName) return null;

  const normalizedName = networkName.trim();

  const networkMap: Record<string, { icon: string; value: string; displayName: string }> = {
    "miden testnet": { icon: "/chain/miden.svg", value: "miden", displayName: "Miden Testnet" },
    ethereum: { icon: "/chain/ethereum.svg", value: "eth", displayName: "Ethereum" },
    solana: { icon: "/chain/solana.svg", value: "sol", displayName: "Solana" },
    base: { icon: "/chain/base.svg", value: "base", displayName: "Base" },
    "bnb smart chain (bep20)": { icon: "/chain/bnb.svg", value: "bnb", displayName: "BNB Smart Chain (BEP20)" },
  };

  // Try exact match first (case-sensitive)
  const exactMatch = networkMap[normalizedName];
  if (exactMatch) {
    return { icon: exactMatch.icon, name: exactMatch.displayName, value: exactMatch.value };
  }

  // Try case-insensitive match
  const lowerName = normalizedName.toLowerCase();
  const caseInsensitiveMatch = networkMap[lowerName];
  if (caseInsensitiveMatch) {
    return {
      icon: caseInsensitiveMatch.icon,
      name: caseInsensitiveMatch.displayName,
      value: caseInsensitiveMatch.value,
    };
  }

  // Try partial match (e.g., "Miden" matches "Miden Testnet")
  for (const [key, network] of Object.entries(networkMap)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return { icon: network.icon, name: network.displayName, value: network.value };
    }
  }

  // Default to Miden if not found, but preserve the original name
  return { icon: "/chain/miden.svg", name: networkName, value: "miden" };
};

export function EditEmployeeContactModal({
  isOpen,
  onClose,
  zIndex,
  contactData,
}: ModalProp<EditEmployeeContactModalProps>) {
  const { isAuthenticated } = useAuth();
  const [selectedToken, setSelectedToken] = useState<TokenDto | null>(contactData?.token || null);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(
    getNetworkFromName(contactData?.network?.name) || {
      icon: "/chain/miden.svg",
      name: "Miden Testnet",
      value: "miden",
    },
  );
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroupResponseDto | undefined>(undefined);
  const { openModal } = useModal();

  const updateEmployee = useUpdateEmployee(Number(contactData?.id));
  const { data: employeeGroups = [] } = useGetAllEmployeeGroups({ enabled: isAuthenticated });

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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<EditContactFormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: contactData?.name || "",
      walletAddress: contactData?.address || "",
      email: contactData?.email || "",
      groupId: undefined,
    },
  });

  const watchedName = watch("name");
  const watchedAddress = watch("walletAddress");

  // Debounce name and address to avoid hitting server on every keystroke
  const [debouncedName, setDebouncedName] = useState(watchedName);
  const [debouncedAddress, setDebouncedAddress] = useState(watchedAddress);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(watchedName);
    }, 500);
    return () => clearTimeout(handler);
  }, [watchedName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAddress(watchedAddress);
    }, 500);
    return () => clearTimeout(handler);
  }, [watchedAddress]);

  const { data: nameDuplicate } = useCheckEmployeeNameDuplicate(debouncedName, selectedGroup?.id ?? 0);
  const { data: addressDuplicate } = useCheckEmployeeAddressDuplicate(debouncedAddress, selectedGroup?.id ?? 0);

  // Update form when modal opens or contactData/groups change
  useEffect(() => {
    if (isOpen && contactData) {
      setValue("name", contactData.name);
      setValue("walletAddress", contactData.address);
      setValue("email", contactData.email || "");
      setSelectedToken(contactData.token || null);

      const matchedGroup = employeeGroups.find(group => group.name === contactData.group);
      setSelectedGroup(matchedGroup);
      setValue("groupId", matchedGroup?.id ?? undefined, { shouldValidate: true, shouldTouch: true });

      // Initialize selectedNetwork from contact data if available
      if (contactData.network) {
        const network = getNetworkFromName(contactData.network.name);
        if (network) {
          setSelectedNetwork(network);
        } else {
          // Fallback if network name doesn't match
          setSelectedNetwork({
            icon: "/chain/miden.svg",
            name: contactData.network.name,
            value: "miden",
          });
        }
      }
    }
  }, [isOpen, contactData, setValue, employeeGroups]);

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
    validate: value => {
      if (!selectedGroup) return true;
      if (contactData?.name && contactData.name.trim().toLowerCase() === value.trim().toLowerCase()) return true;
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
    validate: value => {
      if (!selectedGroup) return true;
      if (contactData?.address && contactData.address.trim().toLowerCase() === value.trim().toLowerCase()) return true;
      if (addressDuplicate?.isDuplicate) return "This address already exists in the selected group";
      return true;
    },
  });

  const emailRegister = register("email", {
    validate: value => {
      // Email is optional - if empty, it's valid
      if (!value || value.trim() === "") return true;

      const trimmedValue = value.trim();

      // Check max length first
      if (trimmedValue.length > 255) {
        return "Email cannot be longer than 255 characters";
      }

      // If email hasn't changed, it's valid
      if (contactData?.email && contactData.email.trim().toLowerCase() === trimmedValue.toLowerCase()) {
        return true;
      }

      // RFC-like email regex provided by user
      const rfcEmailRegex =
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!rfcEmailRegex.test(trimmedValue)) {
        return "Email must be a valid email address";
      }

      return true;
    },
  });

  const onSubmit = async (data: EditContactFormData) => {
    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }

    console.log("🚀 ~ onSubmit ~ selectedGroup:", selectedGroup);
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }

    if (!contactData?.id) {
      toast.error("Contact ID is missing");
      return;
    }

    try {
      const networkPayload: NetworkDto | undefined = selectedNetwork
        ? { name: selectedNetwork.name, chainId: networkChainIds[selectedNetwork.value] ?? 0 }
        : undefined;

      const addressBookData: UpdateAddressBookDto = {
        name: data.name.trim(),
        walletAddress: data.walletAddress.trim(),
        groupId: selectedGroup.id,
        email: data.email?.trim() || undefined,
        token: selectedToken
          ? {
              address: selectedToken.address,
              symbol: selectedToken.symbol,
              // provide metadata if missing so backend validation passes
              decimals: (selectedToken as any).decimals ?? 0,
              name: (selectedToken as any).name ?? selectedToken.symbol,
            }
          : undefined,
        network: networkPayload,
      };

      await updateEmployee.mutateAsync(addressBookData);

      toast.success("Contact updated successfully");

      reset();
      setSelectedToken(null);
      setSelectedGroup(undefined);
      setSelectedNetwork(null);
      onClose();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };

  const handleTokenSelect = (token: TokenDto | null) => {
    setSelectedToken(token);
  };

  const handleNetworkSelect = (network: { icon: string; name: string; value: string } | null) => {
    setSelectedNetwork(network);
  };

  const handleGroupSelect = (group: CompanyGroupResponseDto) => {
    setSelectedGroup(group);
    setValue("groupId", group.id, { shouldValidate: true, shouldTouch: true });
  };

  const handleCancel = () => {
    reset();
    setSelectedToken(contactData?.token || null);
    const matchedGroup = employeeGroups.find(group => group.name === contactData?.group);
    setSelectedGroup(matchedGroup);
    setValue("groupId", matchedGroup?.id ?? undefined, { shouldValidate: true, shouldTouch: true });

    setSelectedNetwork(contactData?.network ? getNetworkFromName(contactData.network.name) : null);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Edit contact" icon="/misc/blue-user-hexagon-icon.svg" onClose={onClose} />
      <div className="bg-background border-2 border-primary-divider rounded-b-2xl w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
          <FormInput
            label="Name"
            placeholder="Enter contact name"
            register={nameRegister}
            error={errors.name?.message}
            disabled={updateEmployee.isPending}
            required
          />

          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            register={emailRegister}
            error={errors.email?.message}
            disabled={updateEmployee.isPending}
          />

          <FormInput
            label="Wallet address"
            placeholder="Enter wallet address"
            register={addressRegister}
            error={errors.walletAddress?.message}
            disabled={updateEmployee.isPending}
            required
          />

          <input type="hidden" {...groupIdRegister} value={selectedGroup?.id ?? ""} />

          {/* Network Selection */}
          <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
            <button
              type="button"
              onClick={() => openModal(MODAL_IDS.SELECT_NETWORK, { onNetworkSelect: handleNetworkSelect })}
              className="flex items-center gap-2 px-4 py-2 h-full w-full text-left cursor-pointer"
              disabled={updateEmployee.isPending}
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
              disabled={updateEmployee.isPending}
            >
              {selectedToken && (
                <img
                  src={
                    selectedToken?.address === "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10"
                      ? "/token/qash.svg"
                      : selectedToken?.symbol
                        ? `/token/${selectedToken.symbol.toLowerCase()}.svg`
                        : "/token/qash.svg"
                  }
                  alt="token"
                  className="w-8 h-8"
                />
              )}
              <div className="flex-1">
                <p className="text-text-secondary text-sm leading-none">Select token</p>
                <p className="text-text-primary text-base font-medium">{selectedToken?.symbol || "-"}</p>
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
              disabled={updateEmployee.isPending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3">
            <SecondaryButton
              text="Cancel"
              onClick={handleCancel}
              buttonClassName="flex-1"
              disabled={updateEmployee.isPending}
              variant="light"
            />
            <PrimaryButton
              text="Update"
              onClick={handleSubmit(onSubmit)}
              containerClassName="flex-1"
              disabled={!selectedGroup || !isValid}
              loading={updateEmployee.isPending}
            />
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

export default EditEmployeeContactModal;
