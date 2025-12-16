"use client";

import React, { useState, useEffect } from "react";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { AssetWithMetadata } from "@/types/faucet";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { MODAL_IDS } from "@/types/modal";
import toast from "react-hot-toast";
import { formatUnits } from "viem";
import { createGiftNote, generateSecret, secretArrayToString } from "@/services/utils/miden/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import useSendGift from "@/hooks/server/useSendGift";
import { useGiftDashboard } from "@/hooks/server/useGiftDashboard";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { FieldErrors, useForm, UseFormRegister } from "react-hook-form";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { PrimaryButton } from "../Common/PrimaryButton";
// import { TokenSelector } from "./TokenSelector";

const GiftAmountInput = ({
  register,
  errors,
  selectedToken,
  watch,
}: {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  selectedToken: AssetWithMetadata;
  watch: any;
}) => {
  const amount = watch("amount");
  const hasAmount = amount && Number(amount) > 0;

  return (
    <div className="relative">
      {hasAmount ? (
        <img src="/gift/otter-2-closed-eyes.svg" alt="otter-2" className="absolute -top-22.5 -left-5 w-25" />
      ) : (
        <img src="/gift/otter-2.svg" alt="otter-2" className="absolute -top-22 -left-5 w-25" />
      )}
      <img
        src="/gift/enter-amount-text.svg"
        alt="enter-amount-text"
        className="absolute -top-10 translate-x-1/2  w-45 -left-6"
      />
      <img src="/gift/pink-gift.svg" alt="pink-gift" className="absolute -top-15 -right-5 w-25" />
      <div className="bg-[#4181FF] rounded-2xl p-2 relative z-1">
        <div className="rounded-2xl p-2 border-2 border-black flex flex-row items-center justify-start gap-2">
          <div className="flex items-center justify-between bg-background rounded-full p-0.5 border ">
            <div className="border-black border-2 rounded-full px-2.5 py-0.5">
              <img
                src={
                  QASH_TOKEN_ADDRESS === selectedToken.faucetId
                    ? "/token/qash.svg"
                    : blo(turnBechToHex(selectedToken?.faucetId || ""))
                }
                alt="token-icon"
                className="w-full"
              />
            </div>
          </div>
          <input
            type="number"
            className="text-4xl font-medium text-left placeholder:text-[#0058D3] text-white bg-transparent border-none outline-none w-full"
            min={0.00001}
            placeholder="0.00"
            autoComplete="off"
            onKeyDown={e => {
              // Prevent 'e', 'E', '+', '-' characters
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            {...register("amount", {
              min: {
                value: 0.00001,
                message: "Minimum amount is 0.00001",
              },
            })}
          />
        </div>
      </div>

      {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
    </div>
  );
};

export const GiftCreationForm: React.FC = () => {
  // **************** Custom Hooks *******************
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { openModal } = useModal();
  const { isConnected } = useWalletConnect();
  const { mutate: sendGift } = useSendGift();
  const { forceFetch: forceRefetchGiftDashboard } = useGiftDashboard();
  const { forceFetch: forceRefetchRecallableNotes } = useRecallableNotes();
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // **************** Local State *******************
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const defaultToken = getDefaultSelectedToken(assets);
    setSelectedToken(defaultToken);
    setSelectedTokenAddress(defaultToken.faucetId);
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

  const handleGenerateLink = async () => {
    if (!isConnected) {
      return openModal(MODAL_IDS.CONNECT_WALLET);
    }

    const { amount: currentAmount } = getValues();

    if (!currentAmount) {
      return toast.error("Invalid amount");
    }

    if (Number(currentAmount) <= 0) {
      return toast.error("Invalid amount");
    }

    // format amount
    const formattedAmount = formatUnits(
      BigInt(Math.round(Number(selectedToken.amount))),
      selectedToken.metadata.decimals,
    );

    if (Number(formattedAmount) < currentAmount) {
      console.log(formattedAmount, currentAmount);
      return toast.error("Insufficient balance");
    }

    if (currentAmount <= 0) {
      return toast.error("Invalid amount");
    }

    openModal(MODAL_IDS.GENERATE_GIFT, {
      onGiftGeneration: async () => {
        try {
          setIsLoading(true);
          toast.loading("Generating gift...");

          // generate secret
          const secret = await generateSecret();

          // parse current amount with decimals
          const parsedAmount = BigInt(currentAmount * Math.pow(10, selectedToken.metadata.decimals));

          // create gift note
          const [outputNote, serialNumber] = await createGiftNote(
            walletAddress,
            selectedToken.faucetId,
            parsedAmount,
            secret,
          );

          console.log("serialNumber", serialNumber);

          // submit transaction
          const txId = await submitTransactionWithOwnOutputNotes(walletAddress, [outputNote]);

          // submit to server

          // turn secret to string
          const secretString = secretArrayToString(secret);

          sendGift({
            assets: [
              {
                faucetId: selectedToken.faucetId,
                amount: currentAmount.toString(),
                metadata: selectedToken.metadata,
              },
            ],
            serialNumber: serialNumber,
            secretNumber: secretString,
            txId: txId,
          });

          // current domain + /gift/open-gift/id
          const giftLink = `${window.location.origin}/gift/open-gift?code=${encodeURIComponent(secretString)}`;

          // refetch everything
          await forceRefetchAssets();
          await forceRefetchGiftDashboard();
          await forceRefetchRecallableNotes();

          toast.dismiss();
          toast.success("Gift created successfully");
          setValue("amount", 0);

          return giftLink;
        } catch (error) {
          toast.dismiss();
          toast.error("Failed to create gift");
          console.error(error);
          throw error; // Re-throw to let the modal handle the error
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-1 items-start h-full rounded-2xl bg-[#E7E7E7] border border-primary-divider w-[25%]">
      <div className="flex justify-between items-center w-full p-2">
        <div className="flex items-start gap-1 justify-center">
          <img src="/gift/red-star-icon.svg" alt="red-star-icon" className="w-9" />
          <span className="text-text-primary text-lg">Create gift</span>
        </div>

        <SelectTokenInput
          selectedToken={selectedToken}
          onTokenSelect={handleTokenSelect}
          tokenAddress={selectedTokenAddress}
        />
      </div>
      <div
        className="flex flex-col h-full justify-between items-center rounded-2xl"
        style={{
          backgroundImage: "url('/gift/create-gift-background.png')",
          backgroundPosition: "bottom",
          backgroundRepeat: "repeat",
          backgroundSize: "100% auto",
        }}
      >
        <div className="flex gap-2.5 justify-end items-end self-stretch h-full px-4">
          <GiftAmountInput register={register} errors={errors} selectedToken={selectedToken} watch={watch} />
        </div>
        <div className="w-full h-full flex justify-end items-end p-2">
          {!isConnected ? (
            <PrimaryButton
              text="Connect Wallet"
              iconPosition="left"
              disabled={isLoading}
              loading={isLoading}
              containerClassName="w-full"
              onClick={() => {
                openModal(MODAL_IDS.CONNECT_WALLET);
              }}
            />
          ) : (
            <div
              className="w-full p-2 rounded-lg cursor-pointer"
              style={{
                background: "linear-gradient(172deg, #029266 50%, #006848 50%)",
              }}
            >
              <button
                onClick={handleGenerateLink}
                disabled={isLoading || watch("amount") <= 0}
                className="relative w-full h-10 bg-[#26D17A] rounded-lg overflow-hidden group disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="absolute top-0 left-4 flex items-center justify-center flex-row w-13 h-full">
                  <img
                    src="/gift/button-stripe-big.svg"
                    alt="button-stripe-big"
                    className="w-full mix-blend-soft-light"
                  />
                </div>
                <div className="absolute top-0 left-11 flex items-center justify-center flex-row w-13 h-full">
                  <img
                    src="/gift/button-stripe-small.svg"
                    alt="button-stripe-small"
                    className="w-full mix-blend-soft-light"
                  />
                </div>

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-2 px-3 py-2 h-full">
                  {/* Star icon */}
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img src="/gift/two-white-star.svg" alt="star" className="w-5 h-5" />
                  </div>

                  {/* Button text */}
                  <span className="text-white text-sm font-medium">
                    {isLoading ? "Generating..." : "Generate Gift Link"}
                  </span>
                </div>

                {/* Inner shadow effect */}
                <div className="absolute inset-0 pointer-events-none shadow-[2px_2px_4px_0px_inset_#03ef71] rounded-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
