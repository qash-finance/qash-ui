"use client";
import React, { useState, useEffect } from "react";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "../Common/ActionButton";

type Step = "init" | "creating" | "final";

interface LoadingBarProps {
  progress: number; // 0-100
  className?: string;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress, className = "" }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const width = `${clampedProgress}%`;

  return (
    <div className={`flex flex-row gap-2 items-center justify-start p-0 relative w-full ${className}`}>
      <div className="basis-0 bg-[#292929] flex flex-row grow h-10 items-center justify-start min-h-px min-w-px overflow-clip p-[6px] relative rounded shrink-0">
        <div
          className="bg-gradient-to-l from-[#caffef] h-full relative rounded shrink-0 to-[#416af9] via-[#6fb2f1]"
          style={{ width }}
        >
          <div
            className="absolute bg-[#b5e0ff] blur-[6px] filter h-10 rounded-[32px] top-[-4px] w-[7.373px]"
            style={{ right: "-3.686px" }}
          />
          <div
            className="absolute bg-[#cefffb] h-10 rounded-[32px] top-1/2 translate-y-[-50%] w-[3px]"
            style={{ right: "-1.5px" }}
          />
        </div>
      </div>
      <div className="font-['Barlow:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#fbfeff] text-[24px] text-right w-14">
        <p className="block leading-[normal]">{Math.round(clampedProgress)}%</p>
      </div>
    </div>
  );
};

export function ConnectWalletModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep === "creating") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [currentStep]);

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case "init":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div
              className="relative flex flex-col gap-2 rounded-b-2xl h-full"
              style={{
                background: "url('/modal/new-wallet-background.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className=" flex flex-col gap-2 h-[300px] rounded-b-2xl">
                <div className="flex-1 flex items-center justify-center text-white">
                  <div className="flex flex-col items-center gap-2">
                    <img src="/modal/blue-wallet-icon.gif" alt="Wallet icon" className="w-15 h-15" />
                    <span className="text-2xl font-bold">Create or Import Your Wallet</span>
                    <span className="text-sm">Create or import a wallet to get started – it's quick and secure.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <ActionButton
                text="Import"
                type="neutral"
                onClick={() => setCurrentStep("creating")}
                className="flex-1"
              />
              <ActionButton text="Connect" onClick={() => setCurrentStep("creating")} className="flex-1" />
            </div>
          </div>
        );

      case "creating":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div className="relative flex flex-col gap-2 rounded-2xl h-full bg-[#141416]">
              <div
                className=" flex flex-col gap-2 h-[300px] rounded-b-2xl"
                style={{
                  background: "url('/modal/sunshine.png')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  mixBlendMode: "lighten",
                }}
              >
                <div className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    {progress < 100 ? (
                      <>
                        <img src="/modal/new-wallet-spinner.gif" alt="Loading" className="w-15 h-15" />
                        <span className="text-2xl font-bold">Creating Your Wallet</span>
                        <span className="text-sm">Just a moment while we set things up securely for you.</span>
                      </>
                    ) : (
                      <>
                        <img src="/modal/green-circle-check.gif" alt="green-circle-check" className="w-15 h-15" />
                        <span className="text-2xl font-bold">Your Wallet is Ready</span>
                        <span className="text-sm">You’re all set — your wallet has been created and secured.</span>
                      </>
                    )}
                  </div>
                  <img src="/modal/blue-spotlight.png" alt="Spotlight" className="absolute top-0  z-5" />
                  <img src="/modal/grid-wall.svg" alt="Grid wall" className="absolute bottom-0 z-0" />
                  {progress < 100 && (
                    <img
                      src="/modal/wave.gif"
                      alt="wave"
                      className="absolute -bottom-30 w-full mix-blend-lighten h-50 rotate-[355deg] scale-125"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="w-full ">
              <LoadingBar progress={progress} />
            </div>
          </div>
        );

      case "final":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div
              className="flex flex-col gap-2 rounded-b-2xl h-[300px] justify-center items-center"
              style={{
                background: "url('/modal/final-wallet-background.svg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative rounded-[20px] bg-black/10 backdrop-blur-[30px] flex flex-col items-center justify-center p-5 min-h-[200px] flex-wrap">
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: "linear-gradient(45deg, #06FFB4, #88CEFF, #0059FF)",
                    padding: "2px",
                    zIndex: -1,
                  }}
                >
                  <div className="w-full h-full rounded-[18px] bg-black/85 backdrop-blur-[50px]" />
                </div>

                <div className="flex flex-col gap-2 items-center justify-center relative z-10 w-full max-w-[402px] px-4">
                  <p className="font-['Barlow:Regular',_sans-serif] text-white text-base text-center leading-tight">
                    Here is your wallet address
                  </p>

                  <p className="font-['Barlow:SemiBold',_sans-serif] text-white text-3xl text-center leading-tight tracking-[-0.64px] break-all">
                    0x2A098898990628505749aBe334547B3f0D0d0F75
                  </p>

                  <button
                    onClick={() => {}}
                    className="bg-[#edf8ff] flex items-center gap-2.5 px-2 py-2 rounded-3xl hover:bg-[#d1e7ff] transition-colors"
                  >
                    <div className="w-3.5 h-3.5 relative">
                      <img alt="Copy" className="w-full h-full" src="/modal/copy-icon.svg" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <ActionButton
                text="Export"
                type="neutral"
                onClick={() => setCurrentStep("creating")}
                className="flex-1"
              />
              <ActionButton text="Continue" onClick={() => setCurrentStep("creating")} className="flex-1" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect wallet" icon="/modal/wallet-icon.gif">
      {renderStepContent()}
    </BaseModal>
  );
}

export default ConnectWalletModal;
