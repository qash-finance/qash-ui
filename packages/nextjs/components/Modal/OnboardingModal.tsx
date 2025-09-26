"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { OnboardingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { MIDEN_EXPLORER_URL, QASH_TOKEN_ADDRESS, QASH_TOKEN_DECIMALS } from "@/services/utils/constant";
import { ActionButton } from "../Common/ActionButton";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { mintToken } from "@/services/utils/miden/faucet";
import toast from "react-hot-toast";
import { useConsumableNotes } from "@/hooks/server/useConsumableNotes";
import { PrimaryButton } from "../Common/PrimaryButton";

export function OnboardingModal({ isOpen, onClose }: ModalProp<OnboardingModalProps>) {
  // **************** Custom Hooks *******************
  const { walletAddress } = useWalletAuth();
  const { forceFetch: forceRefetchConsumableNotes } = useConsumableNotes();
  const router = useRouter();
  const pathname = usePathname();

  // **************** Local State *******************
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMintToken = async () => {
    if (!walletAddress) return toast.error("Please connect your wallet to mint tokens");

    try {
      setLoading(true);
      toast.loading("Minting...");

      // mint qash token to user
      const txId = await mintToken(walletAddress, QASH_TOKEN_ADDRESS, BigInt(10 * 10 ** QASH_TOKEN_DECIMALS));
      toast.dismiss();
      toast.success(
        <div>
          Mint successfully, view transaction on{" "}
          <a href={`${MIDEN_EXPLORER_URL}/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">
            Miden Explorer
          </a>
        </div>,
      );

      // Wait for network propagation then force fresh fetch
      setTimeout(async () => {
        try {
          await forceRefetchConsumableNotes();
        } catch (error) {
          // Retry after additional delay if needed
          setTimeout(async () => {
            await forceRefetchConsumableNotes();
            toast.dismiss();
          }, 3000);
          console.error("Error refetching notes:", error);
        }
      }, 2000);

      setSuccess(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to mint tokens, it might because the faucet was drained!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setSuccess(false);
      }}
    >
      <div className="flex flex-col items-center border-2 border-primary-divider bg-background w-[550px] rounded-2xl">
        {/* Blue glow effect at the top */}
        <main className="flex flex-col gap-6 items-center self-stretch p-3 pt-10 z-10">
          {/* Token Icon and Info */}
          <div className="flex flex-col gap-4 items-center">
            <img src="/token/qash.svg" alt="QASH Token" className="w-16 h-16" />
            <div className="flex flex-col gap-2 items-center">
              <span className="text-5xl font-bold text-text-primary">10</span>
              <span className="text-xl text-text-primary text-center">
                Grab your free test tokens to start exploring Qash on testnet.
              </span>
              <p className="text-sm text-text-secondary">Click below to claim your free tokens</p>
            </div>
          </div>

          {/* Action Button */}
          {success ? (
            <PrimaryButton
              text="Ready to Claim!"
              onClick={() => {
                if (pathname !== "/") {
                  router.push("/");
                }
                onClose();
                setSuccess(false);
              }}
              containerClassName="w-full"
            />
          ) : (
            <PrimaryButton
              text="Request free tokens"
              onClick={handleMintToken}
              loading={loading}
              containerClassName="w-full"
            />
          )}
        </main>
      </div>
    </BaseModal>
  );
}

export default OnboardingModal;
