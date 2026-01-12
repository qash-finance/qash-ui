import { useModal } from "@/contexts/ModalManagerProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { MODAL_IDS } from "@/types/modal";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "../Common/PrimaryButton";
import { BaseContainer } from "../Common/BaseContainer";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useWalletState } from "@/services/store";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { Badge, BadgeStatus } from "../Common/Badge";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { useGetPaymentLinkByCodeForOwner, useUpdatePaymentLink } from "@/services/api/payment-link";
import { UpdatePaymentLink, TokenMetadata } from "@/types/payment-link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PaymentLinkPreview } from "./PaymentLinkPreview";
import { useAuth } from "@/services/auth/context";

interface CreatePaymentLinkFormData {
  title: string;
  description: string;
  amount: string;
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

interface ChainItemProps {
  text: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const SubIcon = ({
  icon,
  onClick,
  tooltipId,
  tooltipContent,
}: {
  icon: string;
  onClick: () => void;
  tooltipId?: string;
  tooltipContent?: string;
}) => {
  return (
    <div
      className="flex justify-center items-center w-[28px] h-[28px] rounded-lg bg-app-background border-t-2 border-primary-divider cursor-pointer"
      onClick={() => {
        onClick();
      }}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >
      <img src={icon} className="w-4" alt={icon} />
    </div>
  );
};

const ChainItem = ({ text, icon, isSelected, onClick }: ChainItemProps) => {
  return (
    <div
      className={`flex flex-row gap-2 w-fit h-fit justify-center items-center bg-app-background rounded-full px-3 py-2 cursor-pointer ${
        isSelected ? "outline outline-primary-blue" : "outline-none"
      }`}
      onClick={onClick}
    >
      {icon && <img src={icon} alt="icon" className="w-5 h-5 rounded-full" />}
      <span className="text-text-primary leading-none">{text}</span>
      <img src="/misc/circle-close-icon.svg" alt="Selected" className="w-5 h-5" />
    </div>
  );
};

const inputContainerClass = "bg-background rounded-xl p-3 border-b-2 border-primary-divider";

const FormInput = ({ label, placeholder, type = "text", register, error, disabled, required }: FormInputProps) => (
  <div className="flex flex-col gap-2">
    <div className="bg-background rounded-xl border-b-2 border-primary-divider">
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

const NetworkBadge = ({ networkId }: { networkId: string }) => {
  return (
    <div className="flex flex-row gap-1 items-center">
      <img alt="" className="w-4 h-4" src={`/chain/${networkId}.svg`} />
    </div>
  );
};

const EditPaymentLinkContainer = () => {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const paymentLinkCode = searchParams.get("code");
  const { walletAddress } = useWalletState(state => state);
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);
  const [isQRCodeCollapsed, setIsQRCodeCollapsed] = useState(true);
  const [isWalletAddressCollapsed, setIsWalletAddressCollapsed] = useState(false);
  const { openModal } = useModal();

  // Fetch the existing payment link data
  const { data: paymentLink, isLoading, error } = useGetPaymentLinkByCodeForOwner(paymentLinkCode || "");
  const { mutateAsync: updatePaymentLink, isPending } = useUpdatePaymentLink();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreatePaymentLinkFormData>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      amount: "",
    },
  });

  // Populate form when payment link data is loaded
  useEffect(() => {
    if (paymentLink) {
      setValue("title", paymentLink.title);
      setValue("description", paymentLink.description);
      setValue("amount", paymentLink.amount);

      // Set selected token if available
      if (paymentLink.acceptedTokens && paymentLink.acceptedTokens.length > 0) {
        const token = paymentLink.acceptedTokens[0];
        // Create a mock AssetWithMetadata object for the selected token
        const mockAsset: AssetWithMetadata = {
          faucetId: token.address,
          amount: "0", // Default amount for display purposes
          metadata: {
            symbol: token.symbol,
            decimals: token.decimals,
            maxSupply: 0, // Default value since we don't have this in TokenMetadata
          },
        };
        setSelectedToken(mockAsset);
      }
    }
  }, [paymentLink, setValue]);

  const handleUpdatePaymentLink = async (data: CreatePaymentLinkFormData) => {
    if (!paymentLink) {
      toast.error("Payment link not found");
      return;
    }

    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }

    try {
      const acceptedTokens: TokenMetadata[] = [
        {
          name: selectedToken.metadata.symbol,
          symbol: selectedToken.metadata.symbol,
          decimals: selectedToken.metadata.decimals,
          address: selectedToken.faucetId,
        },
      ];

      const updateData: UpdatePaymentLink = {
        title: data.title,
        description: data.description,
        amount: data.amount,
        acceptedTokens,
      };

      await updatePaymentLink({ code: paymentLink.code, data: updateData });
      toast.success("Payment link updated successfully!");
      router.push("/payment-link");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update payment link");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full p-4 items-center justify-center gap-4">
        <img src="/loading-square.gif" alt="Loading" className="w-8 h-8" />
        <p className="text-text-secondary">Loading payment link...</p>
      </div>
    );
  }

  // Show error state
  if (error || !paymentLink || !paymentLinkCode) {
    return (
      <div className="flex flex-col w-full h-full p-4 items-center justify-center gap-4">
        <img src="/misc/red-circle-warning.svg" alt="Error" className="w-8 h-8" />
        <p className="text-text-secondary">Failed to load payment link</p>
        <button
          onClick={() => router.push("/payment-link")}
          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:opacity-80"
        >
          Back to Payment Links
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 items-center justify-start gap-10">
      {/* Header */}
      <div className="w-full flex flex-row gap-2 px-7">
        <img src="/misc/star-icon.svg" alt="Payment Link" />
        <h1 className="text-2xl font-bold">Edit Payment Link</h1>
      </div>

      <div className="w-full h-full flex flex-row justify-between items-start gap-5 p-1 bg-[#E7E7E7] rounded-4xl">
        <div className="flex flex-col gap-4 w-[40%] rounded-4xl bg-app-background h-full border-t-2 border-background p-4 items-center justify-between">
          <div className="flex flex-col gap-4 w-full">
            <span className="text-text-primary text-lg font-semibold leading-none">Informations</span>
            <FormInput
              label="Title"
              placeholder="i.e XYZ Donation"
              register={register("title", {
                required: "Title is required",
                maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
              })}
              error={errors.title?.message}
            />
            {/* Message Input */}
            <div className="flex flex-col gap-1">
              <div className={`${inputContainerClass} h-[175px] flex flex-col gap-2`}>
                <div className="flex flex-col gap-0.5 flex-1">
                  <p className="text-text-secondary text-sm">Description</p>
                  <textarea
                    {...register("description", {
                      maxLength: { value: 250, message: "Description cannot exceed 250 characters" },
                    })}
                    className={`w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary h-full resize-none`}
                    autoComplete="off"
                    placeholder="Hey there! Just a quick note to confirm your cryptocurrency transfer."
                    maxLength={250}
                  />
                </div>
              </div>
              <div className="flex justify-between px-3">
                <p className="text-xs text-text-secondary">(Optional)</p>
                <p className="text-xs text-text-secondary">{watch("description")?.length || 0}/250</p>
              </div>
              {errors.description && (
                <div className="flex items-center gap-1 pl-2">
                  <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                  <span className="text-[#E93544] text-sm">{errors.description.message}</span>
                </div>
              )}
            </div>

            <div className={`${inputContainerClass} flex flex-col gap-5`}>
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-primary">Accept payment on</p>
                {/* <div className="flex flex-row gap-2 items-center">
                  <img alt="" className="w-4 h-4" src="/misc/blue-setting-icon.svg" />
                  <p className="text-primary-blue text-sm">Manage payment method</p>
                </div> */}
              </div>
              <div className="flex flex-row gap-0.5 flex-1">
                <ChainItem text="Miden" icon="/chain/miden.svg" isSelected={false} onClick={() => {}} />
              </div>
            </div>

            {/* Token Selector */}
            <div
              className={`bg-background rounded-xl p-3 border-b-2 border-primary-divider flex items-center justify-between cursor-pointer`}
              onClick={() =>
                openModal(MODAL_IDS.SELECT_TOKEN, {
                  selectedToken,
                  onTokenSelect: (token: AssetWithMetadata) => {
                    setSelectedToken(token);
                  },
                })
              }
            >
              <div className="flex gap-3 items-center">
                {selectedToken?.metadata.symbol ? (
                  <>
                    <div className="relative w-10 h-10">
                      <img
                        alt=""
                        className="w-full h-full"
                        src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                      />
                      <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                      <p className="text-text-secondary text-sm">Miden</p>
                    </div>
                  </>
                ) : (
                  <span className="text-text-primary py-2">Select token</span>
                )}
              </div>
              <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
            </div>
            <FormInput
              label="Amount"
              placeholder="Enter amount"
              register={register("amount", {
                required: "Amount is required",
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: "Amount must be a valid positive number",
                },
              })}
              error={errors.amount?.message}
            />
          </div>

          <PrimaryButton
            text="Update Payment Link"
            onClick={handleSubmit(handleUpdatePaymentLink)}
            disabled={!isValid || !selectedToken}
            loading={isPending}
          />
        </div>

        <div className="flex flex-col gap-5 py-5 w-[60%]">
          <div className="flex flex-row gap-2 items-center">
            <img src="/misc/blue-eye-icon.svg" alt="Eye" className="w-6 h-6" />
            <span className="text-text-primary text-2xl font-semibold">Preview</span>
          </div>
          <PaymentLinkPreview
            recipient={user?.teamMembership?.company?.companyName || "Your Company"}
            paymentWalletAddress={walletAddress || ""}
            amount={watch("amount") || ""}
            title={watch("title") || ""}
            description={watch("description") || ""}
            selectedToken={selectedToken || null}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentLinkContainer;
