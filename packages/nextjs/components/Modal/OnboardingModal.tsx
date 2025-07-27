"use client";

import React, { useState } from "react";
import { OnboardingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { AssetWithMetadata } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS, QASH_TOKEN_DECIMALS, QASH_TOKEN_MAX_SUPPLY } from "@/services/utils/constant";
import { ActionButton } from "../Common/ActionButton";
import { useAccount } from "@/hooks/web3/useAccount";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { mintToken } from "@/services/utils/miden/faucet";
import { AccountId } from "@demox-labs/miden-sdk";
import toast from "react-hot-toast";

// Create QASH token data
const qashToken: AssetWithMetadata = {
  faucetId: QASH_TOKEN_ADDRESS,
  amount: "0", // Default amount if user doesn't have any
  metadata: {
    symbol: "QASH",
    decimals: QASH_TOKEN_DECIMALS,
    maxSupply: QASH_TOKEN_MAX_SUPPLY,
  },
};

export function OnboardingModal({ isOpen, onClose }: ModalProp<OnboardingModalProps>) {
  const { walletAddress } = useWalletAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMintToken = async () => {
    if (!walletAddress) return toast.error("Please connect your wallet to mint tokens");

    setLoading(true);
    try {
      // mint qash token to user
      const tx = await mintToken(
        AccountId.fromBech32(walletAddress),
        AccountId.fromBech32(QASH_TOKEN_ADDRESS),
        BigInt(1000 * 10 ** QASH_TOKEN_DECIMALS),
      );

      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Welcome to Qash testnet!" icon="/modal/coin-icon.gif">
      <div
        className="flex flex-col items-center rounded-b-2xl border border-solid bg-stone-900 border-zinc-800 w-[450px] relative overflow-hidden"
        style={{
          backgroundImage: "url(/modal/onboard-background.svg)",
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/30 rounded-full w-100 h-100 blur-3xl" />

        {/* Blue glow effect at the top */}
        <main className="flex flex-col gap-6 items-center self-stretch p-3 z-10">
          {/* Token Icon and Info */}
          <div className="flex flex-col gap-4 items-center">
            <img src="/token/qash.svg" alt="QASH Token" className="w-16 h-16" />
            <div className="flex flex-col gap-2 items-center">
              <span className="text-5xl font-bold text-white">1000</span>
              <span className="text-xl text-white text-center">
                Grab your free test tokens to start exploring Qash on testnet.
              </span>
              <p className="text-sm text-neutral-500">Click below to claim your free tokens</p>
            </div>
          </div>

          {/* Action Button */}
          {loading ? (
            <ActionButton text="■ ■ ■" onClick={() => {}} className="w-full h-10 animate-pulse" disabled />
          ) : success ? (
            <ActionButton
              text="Ready to Claim!"
              onClick={() => {
                onClose();
              }}
              className="w-full h-10"
            />
          ) : (
            <ActionButton text="Request free tokens" onClick={() => handleMintToken()} className="w-full h-10" />
          )}
        </main>
      </div>
    </BaseModal>
  );
}

export default OnboardingModal;
