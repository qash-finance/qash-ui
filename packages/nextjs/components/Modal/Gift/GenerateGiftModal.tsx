"use client";
import React, { useState, useEffect } from "react";
import { MODAL_IDS, GenerateGiftModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import toast from "react-hot-toast";
import { LoadingBar } from "../../Common/LoadingBar";
import { ActionButton } from "@/components/Common/ActionButton";

type Step = "generating" | "created";

export function GenerateGiftModal({ isOpen, onClose, zIndex, ...props }: ModalProp<GenerateGiftModalProps>) {
  const { onGiftGeneration } = props;

  // **************** Local State *******************
  const [currentStep, setCurrentStep] = useState<Step>("created");
  const [progress, setProgress] = useState(0);
  const [giftLink, setGiftLink] = useState<string>("");

  // Start gift generation when modal opens
  useEffect(() => {
    if (isOpen) {
      handleGiftGeneration();
    }
  }, [isOpen]);

  const handleGiftGeneration = async () => {
    setCurrentStep("generating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + 1;
      });
    }, 100);
    try {
      // at least wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute the gift generation logic
      if (onGiftGeneration) {
        const giftLink = await onGiftGeneration();
        setGiftLink(giftLink);
      }

      setProgress(100);
      clearInterval(interval);

      setCurrentStep("created");
    } catch (error) {
      clearInterval(interval);
      console.error("Gift generation failed:", error);
      toast.error("Failed to create gift");
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(giftLink);
    toast.success("Link copied to clipboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "generating":
        return (
          <div className="flex flex-col gap-5 w-[550px] p-4 pt-10 bg-background rounded-3xl border-2 border-primary-divider">
            <div className="flex flex-col gap-2 justify-center items-center">
              {progress < 100 && (
                <>
                  <img src="/gift/otter-gift.svg" alt="Loading" className="w-40" />
                  <span className="text-text-primary font-bold text-2xl">Generating your gift...</span>
                  <span className="text-text-secondary text-sm">Ottey is preparing your gift box — almost ready.</span>
                </>
              )}
            </div>
            <div className="w-full">
              <LoadingBar progress={progress} />
            </div>
          </div>
        );

      case "created":
        return (
          <div className="flex flex-col gap-2 w-[600px] rounded-2xl relative bg-[#1E8FFF] h-[550px] justify-end items-center">
            <img
              src="/gift/generate-gift-background.svg"
              alt="Gift created background"
              className="absolute top-0 left-0 w-full h-full mix-blend-color-burn rounded-2xl"
            />
            <img
              src="/gift/generate-box-gift.svg"
              alt="Gift created background"
              className="absolute top-55 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] animate-wiggle"
            />
            <div
              className="w-[32px] h-[32px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer absolute top-6 right-6"
              onClick={onClose}
            >
              <img src="/misc/close-icon.svg" alt="close icon" />
            </div>
            <div
              className="flex flex-col gap-2 w-full h-[255px] rounded-b-2xl z-10"
              style={{
                background: "url('/gift/generate-gift-text-background.svg')",
                backgroundSize: "cover",
              }}
            >
              <div className="flex flex-col items-center gap-8 z-10 justify-center h-full">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-text-primary text-2xl font-bold">Gift created successfully</span>
                  <span className="text-text-primary text-sm">
                    All done! Ottey has finished your gift — now spread the joy with your friends.
                  </span>
                </div>

                <div className="bg-[#00E09D] rounded-2xl p-2 relative z-1 w-[90%]">
                  <div className="rounded-2xl border-2 border-black flex flex-row items-center justify-between gap-2 px-3 pt-2">
                    <span className="text-text-primary leading-none text-xl mb-2 truncate">{giftLink}</span>

                    <img
                      src="/gift/copy-link-text.svg"
                      alt="copy"
                      className="w-25 cursor-pointer"
                      onClick={handleCopyLink}
                    />
                  </div>
                </div>
              </div>
            </div>
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

export default GenerateGiftModal;
