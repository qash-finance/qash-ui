"use client";

import React, { useState } from "react";
import { OnboardingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { MIDEN_EXPLORER_URL, QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { PrimaryButton } from "../Common/PrimaryButton";
import { createFaucetMintAndConsume } from "@/services/utils/mint";
import BaseModal from "./BaseModal";
import toast from "react-hot-toast";
import { useMidenProvider } from "@/contexts/MidenProvider";

export function OnboardingModal({ isOpen, onClose }: ModalProp<OnboardingModalProps>) {
  // **************** Custom Hooks *******************
  const { client, address, fetchBalances } = useMidenProvider();

  // **************** Local State *******************
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMintToken = async () => {
    if (!address) return toast.error("Please connect your wallet to mint tokens");
    if (!client) return toast.error("Miden client not initialized");

    try {
      setLoading(true);
      toast.loading("Minting...");

      // mint qash token to user
      const txId = await createFaucetMintAndConsume(client, address, QASH_TOKEN_ADDRESS);
      toast.dismiss();
      toast.success(
        <div>
          Mint successfully, view transaction on{" "}
          <a href={`${MIDEN_EXPLORER_URL}/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">
            Miden Explorer
          </a>
        </div>,
      );

      onClose();
      setSuccess(true);
      fetchBalances();
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
      <div className="flex flex-col items-center border-2 border-primary-divider bg-background w-[550px] rounded-2xl ">
        <main className="flex flex-col gap-6 items-center self-stretch p-3 pt-5 z-10 relative">
          {/* Close icon */}
          <div
            className="w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer absolute top-4 right-4"
            onClick={onClose}
          >
            <img src="/misc/close-icon.svg" alt="close icon" />
          </div>
          {/* Token Icon and Info */}
          <div className="flex flex-col gap-4 items-center">
            <img src="/token/qash.svg" alt="QASH Token" className="w-16 h-16" />
            <div className="flex flex-col gap-2 items-center">
              <span className="text-5xl font-bold text-text-primary">100</span>
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
                // if (pathname !== "/") {
                //   router.push("/");
                // }
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
