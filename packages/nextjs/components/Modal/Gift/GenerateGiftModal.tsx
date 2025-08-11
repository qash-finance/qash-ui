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

  // **************** Custom Hooks *******************

  // **************** Local State *******************
  const [currentStep, setCurrentStep] = useState<Step>("generating");
  const [progress, setProgress] = useState(0);
  const [giftLink, setGiftLink] = useState<string>("");

  // Start gift generation when modal opens
  useEffect(() => {
    if (isOpen && onGiftGeneration) {
      handleGiftGeneration();
    }
  }, [isOpen, onGiftGeneration]);

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

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case "generating":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div className="relative flex flex-col gap-2 rounded-2xl h-full bg-[#141416]">
              <div
                className=" flex flex-col gap-2 h-[300px] rounded-b-2xl"
                style={{
                  background: "url('/modal/blue-magic-gift-circle.gif')",
                  backgroundPosition: "center -50%",
                  backgroundSize: "60%",
                  backgroundRepeat: "no-repeat",
                  mixBlendMode: "lighten",
                }}
              >
                <div className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="relative">
                      <img
                        src="/modal/blue-gift.gif"
                        alt="Loading"
                        className="w-30 h-30 z-20 relative"
                        draggable={false}
                      />
                    </div>
                    <span className="text-2xl font-bold">Generating your gift...</span>
                    <span className="text-sm">Please wait while we prepare your gift.</span>
                  </div>
                  <img
                    src="/modal/blue-spotlight.png"
                    alt="Spotlight"
                    className="absolute top-0  z-5"
                    draggable={false}
                  />
                  <img src="/modal/grid-wall.svg" alt="Grid wall" className="absolute bottom-0 z-0" draggable={false} />
                </div>
              </div>
            </div>
            <div className="w-full ">
              <LoadingBar progress={progress} />
            </div>
          </div>
        );

      case "created":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div className="relative flex flex-col gap-2 rounded-2xl h-full bg-[#141416]">
              <div
                className=" flex flex-col gap-2 h-[300px] rounded-b-2xl"
                style={{
                  background: "url('/modal/purple-wave.gif')",
                  backgroundPosition: "center 80%",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  mixBlendMode: "lighten",
                }}
              >
                <div className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <img src="/modal/gift-created.svg" alt="Loading" className="scale-100" draggable={false} />
                    <span className="text-2xl font-bold">Gift created successfully</span>
                    <span className="text-[#989898] text-sm">Share it now and make someone's day!</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white flex flex-row gap-[5px] items-center justify-start pl-5 pr-3 py-3 rounded-xl">
              <span className="flex-3 text-[#066EFF] text-ellipsis overflow-hidden whitespace-nowrap w-full">
                {giftLink}
              </span>
              <ActionButton
                text="Copy link"
                onClick={async () => {
                  await navigator.clipboard.writeText(giftLink);
                  toast.success("Link copied to clipboard");
                }}
                iconPosition="right"
                icon="/copy-icon.svg"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={currentStep === "generating" ? "Generating" : "Gift created!"}
      icon="/gift/gift-icon.svg"
      zIndex={zIndex}
    >
      {renderStepContent()}
    </BaseModal>
  );
}

export default GenerateGiftModal;
