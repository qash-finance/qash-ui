"use client";

import * as React from "react";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
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
  const [currentAmount, setCurrentAmount] = React.useState(amount);
  const [selectedToken, setSelectedToken] = React.useState("USDT");

  const handleAmountChange = (newAmount: string) => {
    setCurrentAmount(newAmount);
    onAmountChange?.(newAmount);
  };

  return (
    <div className="flex flex-col gap-1 items-start self-stretch p-2 rounded-2xl bg-stone-900 w-[365px] max-md:w-full max-md:max-w-[400px]">
      <div className="flex relative flex-col items-center self-stretch rounded-xl flex-[1_0_0] bg-black">
        <div className="flex relative gap-20 justify-end items-center self-stretch pt-2.5 pr-2 pb-2 pl-4 bg-[#2D2D2D] rounded-t-xl">
          <h2 className="absolute top-4 left-4 text-base leading-4 text-white h-[17px] w-full">New gift</h2>
          <SelectTokenInput selectedToken={selectedToken} onTokenSelect={setSelectedToken} />
        </div>
        <div
          className="flex flex-col gap-2.5 justify-center items-center self-stretch px-0 py-10 flex-[1_0_0] rounded-b-xl bg-[#292929]"
          style={{
            backgroundImage: "url('/gift/gift-input-background.svg')",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
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
      <ActionButton text="Generate link gift" onClick={onGenerateLink} className="w-full h-10" />
    </div>
  );
};
