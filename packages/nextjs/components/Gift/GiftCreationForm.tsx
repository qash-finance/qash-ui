"use client";

import * as React from "react";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
import { useState } from "react";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { AssetWithMetadata } from "@/types/faucet";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useAccountContext } from "@/contexts/AccountProvider";
// import { TokenSelector } from "./TokenSelector";

interface GiftCreationFormProps {
  balance?: string;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  onGenerateLink?: () => void;
  onTokenSelect?: () => void;
}

export const GiftCreationForm: React.FC<GiftCreationFormProps> = ({
  balance = "71,055.19",
  amount = "0.00",
  onAmountChange,
  onGenerateLink,
  onTokenSelect,
}) => {
  // **************** Custom Hooks *******************
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();

  // **************** Local State *******************
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: QASH_TOKEN_ADDRESS,
    metadata: {
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY,
    },
  });
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const [currentAmount, setCurrentAmount] = useState(amount);

  React.useEffect(() => {
    const defaultToken = getDefaultSelectedToken(assets);
    setSelectedToken(defaultToken);
    setSelectedTokenAddress(defaultToken.faucetId);
  }, [assets]);

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);

    // Find the selected token in assets to get its address
    if (token.metadata.symbol === "QASH") {
      const qashTokenAddress = require("@/services/utils/constant").QASH_TOKEN_ADDRESS;
      setSelectedTokenAddress(qashTokenAddress);
    } else {
      const selectedAsset = assets.find(asset => asset.metadata.symbol === token.metadata.symbol);
      if (selectedAsset) {
        setSelectedTokenAddress(selectedAsset.faucetId);
      }
    }
  };

  const handleAmountChange = (newAmount: string) => {
    setCurrentAmount(newAmount);
    onAmountChange?.(newAmount);
  };

  return (
    <div className="flex flex-col gap-1 items-start self-stretch p-2 rounded-2xl bg-[#1E1E1E] w-[25%]">
      <div className="flex relative flex-col items-center self-stretch rounded-xl flex-[1_0_0] bg-black">
        <div className="flex relative gap-20 justify-end items-center self-stretch pt-2.5 pr-2 pb-2 pl-4 bg-[#323232] rounded-t-xl">
          <h2 className="absolute top-4 left-4 text-base leading-4 text-white h-[17px] w-full">New gift</h2>
          <SelectTokenInput
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            tokenAddress={selectedTokenAddress}
          />
        </div>
        <div
          className="flex bg-[#2a2a2a] flex-col gap-2.5 justify-center items-center self-stretch px-0 py-10 flex-[1_0_0] rounded-b-xl"
          style={{
            backgroundImage: "url('/gift/gift-bg.svg')",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% auto",
          }}
        >
          <div className="flex gap-2.5 justify-center items-center self-stretch">
            <input
              type="text"
              value={currentAmount}
              onChange={e => handleAmountChange(e.target.value)}
              className="text-5xl font-medium text-center leading-[52.8px] text-neutral-500 max-sm:text-4xl bg-transparent border-none outline-none w-full"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <ActionButton text="Generate link gift" onClick={onGenerateLink} className="mt-2 w-full h-10" />
    </div>
  );
};
