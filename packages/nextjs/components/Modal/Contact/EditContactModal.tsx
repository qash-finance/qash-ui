"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditContactModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { UpdateAddressBookDto, Category } from "@/types/address-book";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { CategoryDropdown } from "../../Common/CategoryDropdown";
import { useUpdateAddressBook, useGetAddressBooksByCategory, useGetCategories } from "@/services/api/address-book";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { AssetWithMetadata } from "@/types/faucet";
import { useAccountContext } from "@/contexts/AccountProvider";
import toast from "react-hot-toast";

interface EditContactFormData {
  name: string;
  address: string;
  email?: string;
  token?: string;
  category: string;
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

export function EditContactModal({ isOpen, onClose, zIndex, contactData }: ModalProp<EditContactModalProps>) {
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(contactData?.token || null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { openModal } = useModal();

  const updateAddressBook = useUpdateAddressBook();
  const { data: categories = [] } = useGetCategories();
  const { data: categoryAddressBooks = [] } = useGetAddressBooksByCategory(
    selectedCategory ? selectedCategory.id : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
  } = useForm<EditContactFormData>({
    defaultValues: {
      name: contactData?.name || "",
      address: contactData?.address || "",
      email: contactData?.email || "",
      category: contactData?.category || "",
    },
  });

  // Update form when contactData changes
  useEffect(() => {
    if (contactData) {
      setValue("name", contactData.name);
      setValue("address", contactData.address);
      setValue("email", contactData.email || "");
      setValue("category", contactData.category);
      setSelectedToken(contactData.token || null);
      // Find the category object from the categories list
      const categoryObj = categories.find(cat => cat.name === contactData.category);
      setSelectedCategory(categoryObj || null);
    }
  }, [contactData, setValue, categories]);

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
      if (!selectedCategory || categoryAddressBooks.length === 0) return true;
      // Exclude current contact from duplicate check
      const isDuplicate = categoryAddressBooks.some(
        contact => contact.id !== Number(contactData?.id) && contact.name.toLowerCase() === value.toLowerCase(),
      );
      return !isDuplicate || "This name already exists in the selected category";
    },
  });

  const addressRegister = register("address", {
    required: "Wallet address is required",
    minLength: {
      value: 3,
      message: "Address is too short",
    },
    pattern: {
      value: /^mt[a-zA-Z0-9]+$/,
      message: "Address must start with 'mt' and contain only letters and numbers",
    },
    validate: value => {
      if (!selectedCategory || categoryAddressBooks.length === 0) return true;
      // Exclude current contact from duplicate check
      const isDuplicate = categoryAddressBooks.some(
        contact => contact.id !== Number(contactData?.id) && contact.address.toLowerCase() === value.toLowerCase(),
      );
      return !isDuplicate || "This address already exists in the selected category";
    },
  });

  const emailRegister = register("email", {
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Email must be a valid email address",
    },
    maxLength: {
      value: 255,
      message: "Email cannot be longer than 255 characters",
    },
    validate: value => {
      if (!value || value.trim() === "") return true; // Email is optional
      if (!selectedCategory || categoryAddressBooks.length === 0) return true;
      // Exclude current contact from duplicate check
      const isDuplicate = categoryAddressBooks.some(
        contact =>
          contact.id !== Number(contactData?.id) &&
          contact.email &&
          contact.email.toLowerCase() === value.toLowerCase(),
      );
      return !isDuplicate || "This email already exists in the selected category";
    },
  });

  const onSubmit = async (data: EditContactFormData) => {
    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!contactData?.id) {
      toast.error("Contact ID is missing");
      return;
    }

    try {
      const addressBookData: UpdateAddressBookDto = {
        name: data.name,
        address: data.address,
        categoryId: selectedCategory.id,
        email: data.email || undefined,
        token: selectedToken,
      };

      await updateAddressBook.mutateAsync({
        id: contactData.id,
        data: addressBookData,
      });

      toast.success("Contact updated successfully");

      reset();
      setSelectedToken(null);
      setSelectedCategory(null);
      onClose();
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast.error("Failed to update contact");
    }
  };

  const handleTokenSelect = (token: AssetWithMetadata | null) => {
    setSelectedToken(token);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setValue("category", category.name);
  };

  const handleCancel = () => {
    reset();
    setSelectedToken(contactData?.token || null);
    const categoryObj = categories.find(cat => cat.name === contactData?.category);
    setSelectedCategory(categoryObj || null);
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
            disabled={updateAddressBook.isPending}
            required
          />

          <FormInput
            label="Wallet address"
            placeholder="Enter wallet address"
            register={addressRegister}
            error={errors.address?.message}
            disabled={updateAddressBook.isPending}
            required
          />

          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            register={emailRegister}
            error={errors.email?.message}
            disabled={updateAddressBook.isPending}
          />

          {/* Token Selection */}
          <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
            <button
              type="button"
              onClick={() => openModal(MODAL_IDS.SELECT_TOKEN, { onTokenSelect: handleTokenSelect })}
              className="flex items-center gap-2 px-4 py-2 h-full w-full text-left cursor-pointer"
              disabled={updateAddressBook.isPending}
            >
              {selectedToken && (
                <img
                  src={
                    selectedToken?.faucetId === "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10"
                      ? "/token/qash.svg"
                      : selectedToken?.metadata.symbol
                        ? `/token/${selectedToken.metadata.symbol.toLowerCase()}.svg`
                        : "/token/qash.svg"
                  }
                  alt="token"
                  className="w-8 h-8"
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
            <CategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory?.name}
              onCategorySelect={handleCategorySelect}
              disabled={updateAddressBook.isPending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3">
            <SecondaryButton
              text="Cancel"
              onClick={handleCancel}
              buttonClassName="flex-1"
              disabled={updateAddressBook.isPending}
              variant="light"
            />
            <PrimaryButton
              text="Update"
              onClick={handleSubmit(onSubmit)}
              containerClassName="flex-1"
              disabled={!selectedCategory || !isValid}
              loading={updateAddressBook.isPending}
            />
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

export default EditContactModal;
