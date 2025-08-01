"use client";

import * as React from "react";
import { GiftCreationForm } from "./GiftCreationForm";
import { GiftStatistics } from "./GiftStatistics";

interface GiftContainerProps {
  onGenerateLink?: () => void;
  onTokenSelect?: () => void;
  onAmountChange?: (amount: string) => void;
  onCopyLink?: (link: string) => void;
}

export const GiftContainer: React.FC<GiftContainerProps> = ({
  onGenerateLink,
  onTokenSelect,
  onAmountChange,
  onCopyLink,
}) => {
  const handleGenerateLink = () => {
    console.log("Generate link clicked");
    onGenerateLink?.();
  };

  const handleTokenSelect = () => {
    console.log("Token selector clicked");
    onTokenSelect?.();
  };

  const handleAmountChange = (amount: string) => {
    console.log("Amount changed:", amount);
    onAmountChange?.(amount);
  };

  const handleCopyLink = (link: string) => {
    console.log("Link copied:", link);
    onCopyLink?.(link);
  };

  return (
    <main className="flex flex-col gap-4 items-center self-stretch p-4 rounded-2xl bg-[#121212] flex-[1_0_0] max-md:p-3 max-sm:p-2">
      <div className="flex gap-4 justify-center items-start self-stretch flex-[1_0_0] max-md:flex-col max-md:gap-3">
        <GiftCreationForm
          onGenerateLink={handleGenerateLink}
          onTokenSelect={handleTokenSelect}
          onAmountChange={handleAmountChange}
        />
        <GiftStatistics onCopyLink={handleCopyLink} />
      </div>
    </main>
  );
};

export default GiftContainer;
