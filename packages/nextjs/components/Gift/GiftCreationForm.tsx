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
import { useForm } from "react-hook-form";
// import { TokenSelector } from "./TokenSelector";

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
    if (isConnected) {
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

      // open double confirm modal
      // Show transaction overview modal first
      openModal(MODAL_IDS.GIFT_TRANSACTION_OVERVIEW, {
        amount: `${currentAmount}`,
        accountAddress: walletAddress,
        transactionType: "Private",
        cancellableTime: `24 hour(s)`,
        tokenAddress: selectedToken.faucetId,
        tokenSymbol: selectedToken.metadata.symbol,
        onConfirm: async () => {
          // Open the GenerateGiftModal with the gift generation logic
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
        },
      });
    } else {
      openModal(MODAL_IDS.CONNECT_WALLET);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-start self-stretch p-2 rounded-2xl bg-[#1E1E1E] w-[25%]">
      <div className="flex relative flex-col items-center self-stretch rounded-xl flex-[1_0_0] bg-black">
        <div className="flex relative gap-20 justify-end items-center self-stretch pt-2.5 pr-2 pb-2 pl-4 bg-[#323232] rounded-t-xl">
          <h2 className="absolute top-4 left-4 text-base leading-4 text-white h-[17px] w-fit">New gift</h2>
          <SelectTokenInput
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            tokenAddress={selectedTokenAddress}
          />
        </div>
        <div
          className="flex bg-[#2a2a2a] flex-col gap-2.5 justify-center items-center self-stretch px-0 py-10 flex-[1_0_0] rounded-b-xl"
          style={{
            backgroundImage: "url('/gift/gift-bg.svg')",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% auto",
          }}
        >
          <div className="flex gap-2.5 justify-center items-center self-stretch">
            <input
              type="number"
              className="text-5xl font-medium text-center leading-[52.8px] text-neutral-500 max-sm:text-4xl bg-transparent border-none outline-none w-full"
              min={0.00001}
              placeholder="0.00"
              autoComplete="off"
              {...register("amount", {
                min: {
                  value: 0.00001,
                  message: "Minimum amount is 0.00001",
                },
              })}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
          </div>
        </div>
      </div>
      {!isConnected ? (
        <ActionButton
          text="Connect Wallet"
          buttonType="submit"
          className="w-full h-10 mt-2"
          onClick={() => {
            openModal(MODAL_IDS.CONNECT_WALLET);
          }}
        />
      ) : (
        <ActionButton
          loading={isLoading}
          text="Generate link gift"
          onClick={handleGenerateLink}
          className="mt-2 w-full h-10"
          disabled={watch("amount") <= 0}
        />
      )}
    </div>
  );
};
