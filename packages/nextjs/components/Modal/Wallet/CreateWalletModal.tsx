"use client";

import React, { useState, useEffect } from "react";
import { CreateWalletModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { LoadingBar } from "../../Common/LoadingBar";
import toast from "react-hot-toast";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useCreateDefaultGroup } from "@/services/api/group-payment";
import { CreateGroupDto } from "@/types/group-payment";

type Step = "CREATING" | "FINAL";

export function CreateWalletModal({ isOpen, onClose, zIndex }: ModalProp<CreateWalletModalProps>) {
  const [currentStep, setCurrentStep] = useState<Step>("CREATING");
  const [progress, setProgress] = useState(0);
  const [accountId, setAccountId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  // Custom hooks
  const { handleCreateWallet } = useWalletConnect();
  const { connectWallet } = useWalletAuth();
  const { mutate: createGroup } = useCreateDefaultGroup();

  // Function to create default "Quick Share" group
  const createQuickShareGroup = async () => {
    try {
      const quickShareGroup: CreateGroupDto = {
        name: "Quick Share",
        members: [], // Add the new account as a member
      };

      createGroup(quickShareGroup, {
        onSuccess: () => {
          console.log("Default Quick Share group created successfully");
        },
        onError: error => {
          console.error("Failed to create default Quick Share group:", error);
          // Don't show error toast to user as this is a background operation
        },
      });
    } catch (error) {
      console.error("Error creating default Quick Share group:", error);
    }
  };

  // Handle wallet creation when modal opens
  useEffect(() => {
    if (isOpen && currentStep === "CREATING") {
      handleCreateClick();
    }
  }, [isOpen]);

  const handleCreateClick = async () => {
    setCurrentStep("CREATING");
    setIsImporting(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    // at least wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    const accountId = await handleCreateWallet();

    if (accountId) {
      setAccountId(accountId);
      // Authenticate the newly created wallet
      try {
        await connectWallet(accountId);
        // Create default "Quick Share" group after successful authentication
        await createQuickShareGroup();
      } catch (error) {
        console.error("Failed to authenticate new wallet:", error);
        // Continue anyway since wallet was created successfully
      }
    }

    setProgress(100);
    clearInterval(interval);

    setTimeout(() => {
      setCurrentStep("FINAL");
    }, 1500);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "CREATING":
        return (
          <div className="flex flex-col gap-5 w-[550px] p-4 pt-10 bg-background rounded-3xl border-2 border-primary-divider">
            <div className="flex flex-col gap-2 justify-center items-center">
              {progress < 100 ? (
                <>
                  <img src="/modal/3d-hexagon-qash-icon.svg" alt="Loading" className="w-40" />
                  <span className="text-text-primary font-bold text-2xl">Creating Your Wallet</span>
                  <span className="text-text-secondary text-sm">
                    Just a moment while we set things up securely for you.
                  </span>
                </>
              ) : (
                <>
                  <img src="/modal/hexagon-success-icon.svg" alt="Loading" className="w-40" />
                  <span className="text-text-primary font-bold text-2xl">Your Wallet Is Ready</span>
                  <span className="text-text-secondary text-sm">
                    You’re all set — your wallet has been created and secured.
                  </span>
                </>
              )}
            </div>
            <div className="w-full">
              <LoadingBar progress={progress} />
            </div>
          </div>
        );

      case "FINAL":
        return (
          <div className="flex flex-col gap-5 w-[550px] p-4 pt-10 bg-background rounded-3xl border-2 border-primary-divider">
            <div className="flex flex-col gap-2 justify-center items-center">
              <img src="/modal/hexagon-wallet-icon.svg" alt="Loading" className="w-40" />
              <span className="text-text-secondary text-sm">Here is your wallet address</span>
              <span className="text-text-primary font-bold text-2xl">{accountId}</span>
            </div>
            <PrimaryButton text="Discover now" onClick={onClose} containerClassName="w-full" />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      {renderStepContent()}
    </BaseModal>
  );
}

export default CreateWalletModal;
