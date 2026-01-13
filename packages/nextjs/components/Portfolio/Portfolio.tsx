"use client";

import React, { useState, useEffect } from "react";
import { WalletHeader } from "./WalletHeader";
import { TokenList } from "./TokenList";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { PortfolioModalProps } from "@/types/modal";
import { BalanceVisibilityProvider } from "@/contexts/BalanceVisibilityProvider";
import Accounts from "./Accounts";

const Portfolio = ({ isOpen, onClose }: ModalProp<PortfolioModalProps>) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [choosingAccount, setChoosingAccount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the element is rendered before animation starts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return (
    <div
      data-tour="portfolio-section"
      className="portfolio fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out
        ${isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}
      `}
        style={{ zIndex: 1 }}
        onClick={handleClose}
      />
      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-app-background h-full w-[470px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2 }}
      >
        {/* Wallet Header */}
        <div className="flex relative flex-col gap-2 items-start self-stretch flex-[1_0_0] overflow-hidden">
          <BalanceVisibilityProvider>
            <div
              className={`flex w-[200%] h-full transition-transform duration-300 ease-in-out ${
                choosingAccount ? "-translate-x-1/2" : "translate-x-0"
              }`}
            >
              <div className="w-1/2 h-full flex flex-col gap-2">
                <WalletHeader onClose={handleClose} onChooseAccount={() => setChoosingAccount(true)} />
                <TokenList />
              </div>
              <div className="w-1/2 h-full flex flex-col gap-2">
                <div className="w-full justify-center flex items-center p-2 relative h-20">
                  <img
                    src="/arrow/chevron-left.svg"
                    alt="back"
                    className="w-6 absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setChoosingAccount(false)}
                  />
                  <span className="text-2xl font-medium">Accounts</span>
                </div>
                <Accounts />
              </div>
            </div>
          </BalanceVisibilityProvider>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
