"use client";
import React, { useCallback, useState, useEffect } from "react";
import { MODAL_IDS, NewRequestModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { ActionButton } from "../Common/ActionButton";
import BaseModal from "./BaseModal";
import { useForm } from "react-hook-form";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { CreateRequestPaymentDto } from "@/types/request-payment";
import { useCreatePendingRequest } from "@/services/api/request-payment";
import { toast } from "react-hot-toast";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useAccountContext } from "@/contexts/AccountProvider";

interface RequestFormData {
  amount: string;
  message: string;
  recipientAddress?: string;
}

export function NewRequestModal({ isOpen, onClose, zIndex, recipient }: ModalProp<NewRequestModalProps>) {
  // **************** Local State *******************
  const [isLoading, setIsLoading] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: QASH_TOKEN_ADDRESS,
    metadata: {
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY,
    },
  });
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");

  // **************** Hooks *******************
  const { walletAddress } = useWalletAuth();
  const { isConnected } = useWalletConnect();
  const { openModal } = useModal();
  const { assets } = useAccountContext();
  const { mutate: createRequestPayment } = useCreatePendingRequest();
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    getValues,
    reset,
  } = useForm<RequestFormData>({
    defaultValues: {
      amount: undefined,
      message: undefined,
      recipientAddress: undefined,
    },
  });

  // **************** Effects *******************
  useEffect(() => {
    if (recipient) {
      setValue("recipientAddress", recipient, { shouldValidate: true });
    } else {
      setValue("recipientAddress", undefined, { shouldValidate: true });
    }
  }, [recipient]);

  // **************** Handlers *******************
  useEffect(() => {
    const defaultToken = getDefaultSelectedToken(assets);
    setSelectedToken(defaultToken);
  }, [assets]);

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);

    if (token.metadata.symbol === QASH_TOKEN_SYMBOL) {
      const qashTokenAddress = require("@/services/utils/constant").QASH_TOKEN_ADDRESS;
      setSelectedTokenAddress(qashTokenAddress);
    } else {
      const selectedAsset = assets.find(asset => asset.metadata.symbol === token.metadata.symbol);
      if (selectedAsset) {
        setSelectedTokenAddress(selectedAsset.faucetId);
      }
    }
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_EMPLOYEE, {
      onSave: (address: string, name: string) => {
        setValue("recipientAddress", address, { shouldValidate: true });
        setRecipientName(name);
      },
    });
  };

  const onSubmit = async (data: RequestFormData) => {
    setIsLoading(true);
    if (!walletAddress) {
      return;
    }

    if (!data.recipientAddress) {
      toast.error("Please select a recipient");
      setIsLoading(false);
      return;
    }

    if (walletAddress === data.recipientAddress) {
      toast.error("You cannot request from yourself");
      setIsLoading(false);
      return;
    }

    const createRequestPaymentDto: CreateRequestPaymentDto = {
      payer: data.recipientAddress,
      payee: walletAddress,
      amount: data.amount,
      message: data.message,
      tokens: [selectedToken],
    };

    createRequestPayment(createRequestPaymentDto, {
      onSuccess: () => {
        toast.success("Request created successfully");
        onClose();
        reset();
      },
      onError: () => {
        toast.error("Failed to create request");
      },
    });
    setIsLoading(false);
  };

  // Debounced address validation
  const validateAddress = useCallback((address?: string) => {
    try {
      if (!address) return false;
      if (address.startsWith("mt")) {
        return true;
      }
      // address need to be at least 36 characters
      if (address.length < 36) {
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Request" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <form className="flex flex-col gap-0">
        <div className="flex flex-col rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800 max-h-[800px] overflow-y-auto w-[550px] p-2">
          {/* Amount */}
          <div
            className="flex flex-col text-white rounded-xl justify-center items-center h-[200px]"
            style={{
              backgroundImage: "url('/modal/request-background.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <header className="flex flex-wrap  justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] flex-1 rounded-t-xl">
              <h2 className="text-white mt-0.5">Requesting</h2>
              <SelectTokenInput
                selectedToken={selectedToken}
                onTokenSelect={handleTokenSelect}
                tokenAddress={selectedTokenAddress}
              />
            </header>

            <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle flex-3/4 justify-center">
              <input
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^[0-9]*\.?[0-9]{0,2}$/,
                    message: "Invalid amount format",
                  },
                  min: {
                    value: 0,
                    message: "Amount must be positive",
                  },
                })}
                autoComplete="off"
                className="text-white text-center outline-none"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.000000000000000001"
                inputMode="decimal"
                onKeyDown={e => {
                  if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
              {errors.amount && <span className="text-red-500 text-sm mt-1">{errors.amount.message}</span>}
            </div>
          </div>

          {/* Recipient Input */}
          {/* If recipient name is not set, show the input */}
          {!recipientName ? (
            <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
              <div className="flex flex-wrap gap-2.5 items-center">
                <img
                  src="/default-avatar-icon.png"
                  alt="Recipient avatar"
                  className="object-contain shrink-0 aspect-square w-[40px]"
                />
                <div className="flex flex-col flex-1 ">
                  <div className="flex gap-2 items-center self-start whitespace-nowrap w-full">
                    <label className="text-base leading-none text-center text-white">From</label>
                    <input
                      {...register("recipientAddress", {
                        validate: (value?: string) => {
                          if (!value) return true; // Don't show error when empty
                          if (!value.startsWith("mt")) return "Address must start with 'mt'";
                          if (value.length < 36) return "Address must be at least 36 characters";
                          return true;
                        },
                      })}
                      autoComplete="off"
                      type="text"
                      placeholder="Enter address or choose from your contacts book"
                      className=" flex-1 leading-none text-white bg-transparent outline-none placeholder:text-neutral-600 w-full"
                    />
                  </div>
                </div>
                {watch("recipientAddress") && validateAddress(watch("recipientAddress")) ? (
                  <ActionButton
                    text="Remove"
                    type="deny"
                    onClick={() => {
                      setRecipientName("");
                      setValue("recipientAddress", undefined);
                    }}
                  />
                ) : (
                  <ActionButton text="Choose" onClick={handleChooseRecipient} />
                )}
              </div>

              {watch("recipientAddress") && !validateAddress(watch("recipientAddress")) && (
                <span className="text-sm text-red-500">Invalid recipient address</span>
              )}
            </section>
          ) : (
            <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
              <div className="flex flex-wrap gap-2.5 items-center">
                <img
                  src="/default-avatar-icon.png"
                  alt="Recipient avatar"
                  className="object-contain shrink-0 aspect-square w-[40px]"
                />
                <div className="flex flex-col flex-1 shrink justify-center basis-5 min-w-60">
                  <div className="flex gap-2 items-center self-start whitespace-nowrap">
                    <label className="text-base leading-none text-center text-white">From</label>
                    <span className="text-base tracking-tight leading-none text-neutral-600">{recipientName}</span>
                  </div>
                  <span className="mt-2 text-base tracking-tight leading-none text-white bg-transparent outline-none">
                    {getValues("recipientAddress")}
                  </span>
                </div>
                <ActionButton
                  text="Remove"
                  type="deny"
                  onClick={() => {
                    setRecipientName("");
                    setValue("recipientAddress", undefined);
                  }}
                />
              </div>
            </section>
          )}

          {/* Message */}
          <div
            className="flex flex-col text-white rounded-xl"
            style={{
              backgroundColor: "#1E1E1E",
            }}
          >
            <header className="flex flex-wrap gap-5 justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] rounded-t-xl">
              <h2 className="text-white mt-0.5">Message</h2>
              <h2 className="text-[#505050] mt-0.5">0/200</h2>
            </header>

            <div className="flex flex-col text-xl font-medium leading-none text-center align-middle row-span-5 p-2 bg-[#1E1E1E] rounded-b-xl border border-solid border-[#2D2D2D]">
              <textarea
                {...register("message", {
                  maxLength: {
                    value: 200,
                    message: "Message cannot exceed 200 characters",
                  },
                  required: "Message is required",
                })}
                style={{
                  resize: "none",
                }}
                className="text-white outline-none text-base"
                placeholder="Your message"
                rows={5}
              />
              {errors.message && <span className="text-red-500 text-sm mt-1">{errors.message.message}</span>}
            </div>
          </div>

          <div className="flex flex-row w-full gap-2 mt-2">
            <ActionButton text="Cancel" onClick={onClose} type="neutral" className="flex-1" loading={isLoading} />
            {isConnected ? (
              <ActionButton
                text="Send Request"
                onClick={handleSubmit(onSubmit)}
                className="flex-3/4"
                loading={isLoading}
              />
            ) : (
              <ActionButton
                text="Connect Wallet"
                onClick={() => {
                  openModal(MODAL_IDS.CONNECT_WALLET);
                }}
                className="flex-3/4"
              />
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

export default NewRequestModal;
