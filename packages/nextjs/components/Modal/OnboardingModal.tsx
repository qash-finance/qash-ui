"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MODAL_IDS, OnboardingModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import {
  FAILED_SUBMIT_PROVEN_TRANSACTION,
  MIDEN_EXPLORER_URL,
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
} from "@/services/utils/constant";
import { ActionButton } from "../Common/ActionButton";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { mintToken } from "@/services/utils/miden/faucet";
import toast from "react-hot-toast";
import { useConsumableNotes } from "@/hooks/server/useConsumableNotes";

export function OnboardingModal({ isOpen, onClose }: ModalProp<OnboardingModalProps>) {
  // **************** Custom Hooks *******************
  const { walletAddress } = useWalletAuth();
  const { forceFetch: forceRefetchConsumableNotes } = useConsumableNotes();
  const router = useRouter();
  const pathname = usePathname();
  const { openModal } = useModal();

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
          toast.loading("Fetching your free tokens...");
          await forceRefetchConsumableNotes();
          toast.dismiss();
          toast.success("Tokens fetched successfully");
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
      if (error) {
        openModal(MODAL_IDS.SOMETHING_WRONG, {
          tryAgain: async () => {
            await handleMintToken();
          },
        } as any);
      }
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
      title="Welcome to Qash testnet!"
      icon="/modal/coin-icon.gif"
    >
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
              <span className="text-5xl font-bold text-white">10</span>
              <span className="text-xl text-white text-center">
                Grab your free test tokens to start exploring Qash on testnet.
              </span>
              <p className="text-sm text-neutral-500">Click below to claim your free tokens</p>
            </div>
          </div>

          {/* Action Button */}
          {success ? (
            <ActionButton
              text="Ready to Claim!"
              onClick={() => {
                if (pathname !== "/dashboard/pending-receive") {
                  router.push("/dashboard/pending-receive");
                }
                onClose();
                setSuccess(false);
              }}
              className="w-full h-10"
            />
          ) : (
            <ActionButton
              text="Request free tokens"
              onClick={() => handleMintToken()}
              className="w-full h-10"
              loading={loading}
            />
          )}
        </main>
      </div>
    </BaseModal>
  );
}

export default OnboardingModal;
