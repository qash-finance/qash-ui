import React, { useEffect, useState } from "react";
import { useModal } from "@/contexts/ModalManagerProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { MODAL_IDS } from "@/types/modal";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "../Common/PrimaryButton";
import { formatUnits } from "viem";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";

const SelectTokenInput = ({
  onTokenSelect,
  selectedToken,
}: {
  onTokenSelect: () => void;
  selectedToken: AssetWithMetadata | null;
}) => {
  return (
    <div
      className="flex justify-center items-center p-1 bg-app-background rounded-xl border border-primary-divider cursor-pointer"
      onClick={onTokenSelect}
    >
      <div className="flex flex-row gap-5 items-center justify-center bg-background rounded-lg border-b-3 border-primary-divider p-2">
        <div className="flex flex-row gap-2 items-center justify-center">
          {selectedToken && (
            <img
              src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
              alt={selectedToken.metadata.symbol}
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-text-primary leading-none">{selectedToken?.metadata.symbol || "Select token"}</span>
        </div>
        <img src="/arrow/chevron-down.svg" alt="chevron-down" className="w-5 h-5" />
      </div>
    </div>
  );
};

const SwapIcon = ({ onSwap }: { onSwap: () => void }) => {
  const [rotation, setRotation] = useState(0);

  const handleClick = () => {
    setRotation(prev => prev + 180);
    onSwap();
  };

  return (
    <div
      className="w-fit p-2 rounded-lg border border-background outline-[#EBEBEB] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 cursor-pointer"
      style={{
        background: "linear-gradient(180deg, #E7E7E7 0%, #FFF 91.34%)",
        boxShadow: "0px 4.8px 12px 0px rgba(0, 0, 0, 0.1)",
      }}
      onClick={handleClick}
    >
      <img
        src="/arrow/half-up-down-arrow.svg"
        alt="swap"
        className="w-7 h-7 transition-transform duration-300"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};

const SwapPreview = ({
  fromToken,
  toToken,
  fromAmount,
  receiveAmount,
  isVisible,
}: {
  fromToken: AssetWithMetadata | null;
  toToken: AssetWithMetadata | null;
  fromAmount: string;
  receiveAmount: string;
  isVisible: boolean;
}) => {
  // ===== MOCK DATA - REPLACE WITH REAL API INTEGRATION =====
  // TODO: Replace with real price calculation when API is integrated
  const mockPrice = fromToken && toToken ? "4378.15" : "0"; // MOCK: Hardcoded exchange rate
  const mockPriceUsd = fromToken && toToken ? "4,385" : "0"; // MOCK: Hardcoded USD price
  const networkFee = "$0.23"; // MOCK: Hardcoded network fee
  const slippageTolerance = "0.5%"; // MOCK: Hardcoded slippage tolerance

  const titleStyle = "text-text-secondary text-sm leading-5 font-medium tracking-[-0.56px]";
  const valueStyle = "text-text-primary text-sm leading-5 font-medium tracking-[-0.56px]";

  return (
    <div
      className={`border-t border-primary-divider flex flex-col gap-4 items-start px-0  w-full  overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? "max-h-96 opacity-100 py-3 mt-2" : "max-h-0 opacity-0 py-0 mt-0"
      }`}
    >
      {/* Price */}
      <div className="flex items-center justify-between px-4 py-0 w-full">
        <p className={titleStyle}>Price</p>
        <p className={valueStyle}>
          1 {fromToken?.metadata.symbol || "ETH"} = {mockPrice} {toToken?.metadata.symbol || "USDC"}
          <span className="text-[#848484]">{` ($${mockPriceUsd})`}</span>
        </p>
      </div>

      {/* Network fees */}
      <div className="flex items-center justify-between px-4 py-0 w-full">
        <p className={titleStyle}>Network fees</p>
        <div className="flex gap-2 items-center">
          {fromToken && (
            <div className="w-5 h-5 rounded-full overflow-hidden">
              <img
                src={fromToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                alt={fromToken.metadata.symbol}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className={valueStyle}>{networkFee}</p>
        </div>
      </div>

      {/* Slippage Tolerance */}
      <div className="flex items-center justify-between px-4 py-0 w-full">
        <p className={titleStyle}>Slippage Tolerance</p>
        <p className={valueStyle}>{slippageTolerance}</p>
      </div>
    </div>
  );
};

interface SwapFormData {
  fromAmount: string;
}

export const Swap = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [fromToken, setFromToken] = useState<AssetWithMetadata | null>(null);
  const [toToken, setToToken] = useState<AssetWithMetadata | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const { openModal } = useModal();

  const { register, watch, setValue } = useForm<SwapFormData>({
    defaultValues: {
      fromAmount: "",
    },
  });

  const fromAmount = watch("fromAmount");

  // ===== MOCK CALCULATION - REPLACE WITH REAL QUOTE API =====
  // TODO: Remove this mock calculation when real quote API is integrated
  const calculateMockReceiveAmount = (
    amount: string,
    fromToken: AssetWithMetadata | null,
    toToken: AssetWithMetadata | null,
  ) => {
    if (!amount || !fromToken || !toToken) return "0";

    // MOCK: Random exchange rate calculation (random between 0.8 and 1.2)
    const mockRate = 0.8 + Math.random() * 0.4; // MOCK: Random rate generation
    const receiveAmount = parseFloat(amount) * mockRate;

    return receiveAmount.toFixed(6);
  };

  // MOCK: Calculate receive amount using mock exchange rate
  const mockReceiveAmount = calculateMockReceiveAmount(fromAmount, fromToken, toToken);

  // Check if amount exceeds balance
  const exceedsBalance =
    fromToken && fromAmount
      ? parseFloat(fromAmount) >
        parseFloat(formatUnits(BigInt(Math.round(Number(fromToken.amount))), fromToken.metadata.decimals))
      : false;

  const handleFromTokenSelect = () => {
    openModal(MODAL_IDS.SELECT_TOKEN, {
      onTokenSelect: setFromToken,
    });
  };

  const handleToTokenSelect = () => {
    openModal(MODAL_IDS.SELECT_TOKEN, {
      onTokenSelect: setToToken,
    });
  };

  const handleSwap = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // ===== MOCK QUOTE SIMULATION - REPLACE WITH REAL API CALL =====
  // TODO: Replace with real quote API call
  const simulateGettingQuote = () => {
    setIsGettingQuote(true);
    // MOCK: Simulate API delay with setTimeout
    setTimeout(() => {
      setIsGettingQuote(false);
    }, 2000); // MOCK: 2 second delay
  };

  // ===== MOCK QUOTE TRIGGER - REPLACE WITH REAL API INTEGRATION =====
  // Watch for changes in fromAmount and trigger quote simulation
  useEffect(() => {
    if (fromAmount && fromToken && toToken && !isGettingQuote) {
      const timeoutId = setTimeout(() => {
        simulateGettingQuote(); // MOCK: Replace with real API call
      }, 500); // MOCK: Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [fromAmount, fromToken, toToken]); // Removed isGettingQuote from dependencies to prevent loop

  // Hide preview when tokens or amount change
  useEffect(() => {
    setShowPreview(false);
  }, [fromToken, toToken, fromAmount]);

  return (
    <div className="flex flex-col w-full h-full p-3 gap-1">
      {/* You pay */}
      <div className="flex flex-col gap-2 w-full h-full bg-background rounded-xl border-b-2 border-primary-divider p-3 py-5">
        <span className="text-text-secondary text-sm leading-none">You pay</span>
        <div className="flex flex-row gap-2 items-center justify-between">
          <input
            {...register("fromAmount")}
            type="number"
            className={`text-3xl leading-none placeholder:text-text-secondary placeholder:opacity-50 outline-none font-semibold ${
              exceedsBalance ? "text-[#FB3748]" : "text-text-primary"
            }`}
            placeholder="Enter amount"
            inputMode="decimal"
            step="0.000000000000000001"
            onKeyDown={e => {
              if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
              if (e.key === "e" || e.key === "E") e.preventDefault();
            }}
          />
          <SelectTokenInput onTokenSelect={handleFromTokenSelect} selectedToken={fromToken} />
        </div>
        <div
          className={`flex flex-row gap-2 items-center justify-between mt-2 ${fromToken === null ? "py-3" : "py-0"}`}
        >
          {fromToken && (
            <>
              {/* MOCK: Hardcoded USD value - replace with real price calculation */}
              <span className="text-text-secondary text-sm leading-none">$0</span>
              <div className="flex flex-row gap-2 items-center justify-center">
                <img
                  src="/misc/wallet-icon.svg"
                  alt="wallet-icon"
                  className="w-4 h-4"
                  style={{ filter: "brightness(0)" }}
                />
                <span className={`text-sm leading-none ${exceedsBalance ? "text-[#FB3748]" : "text-text-secondary"}`}>
                  {formatNumberWithCommas(
                    formatUnits(BigInt(Math.round(Number(fromToken?.amount))), fromToken?.metadata.decimals),
                  )}{" "}
                  {fromToken?.metadata.symbol}
                </span>
                <div
                  className="flex justify-center items-center px-2 py-1 rounded-full bg-[#E8F4FF] cursor-pointer"
                  onClick={() => {
                    setValue(
                      "fromAmount",
                      formatUnits(BigInt(Math.round(Number(fromToken?.amount))), fromToken?.metadata.decimals),
                    );
                  }}
                >
                  <span className="text-primary-blue text-sm leading-none">Max</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center w-full relative">
        <SwapIcon onSwap={handleSwap} />
      </div>

      {/* You receive */}
      <div className="flex flex-col gap-2 w-full h-full bg-background rounded-xl border-b-2 border-primary-divider p-3 py-5">
        <span className="text-text-secondary text-sm leading-none">You receive</span>
        <div className="flex flex-row gap-2 items-center justify-between">
          <span className="text-text-primary text-3xl leading-none placeholder:text-text-secondary placeholder:opacity-50 outline-none">
            {/* ===== MOCK RECEIVE AMOUNT - REPLACE WITH REAL QUOTE ===== */}
            {/* TODO: Replace with real quote amount when API is integrated */}
            {mockReceiveAmount}
          </span>
          <SelectTokenInput onTokenSelect={handleToTokenSelect} selectedToken={toToken} />
        </div>
        <div className="flex flex-row gap-2 items-center justify-between mt-2">
          {/* MOCK: Hardcoded USD value - replace with real price calculation */}
          <span className="text-text-secondary text-sm leading-none">$0</span>
        </div>
      </div>

      {/* Swap Preview */}
      <SwapPreview
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        receiveAmount={mockReceiveAmount} // MOCK: Pass mock receive amount to preview
        isVisible={showPreview}
      />

      <PrimaryButton
        text={
          isGettingQuote
            ? "Finalizing quote..."
            : exceedsBalance
              ? "Insufficient Balance"
              : fromToken && toToken
                ? "Preview Swap"
                : "Enter amount"
        }
        icon={isGettingQuote ? "/portfolio/loading-icon.gif" : undefined}
        iconPosition="left"
        disabled={!fromAmount || !fromToken || !toToken || isGettingQuote || exceedsBalance}
        onClick={() => {
          if (fromToken && toToken && fromAmount && !isGettingQuote && !exceedsBalance) {
            setShowPreview(!showPreview);
          }
        }}
      />

      {/* ===== MOCK EXCHANGE RATE DISPLAY - REPLACE WITH REAL PRICE ===== */}
      {fromToken && toToken && (
        <div className="flex w-full justify-center items-center pt-2">
          <span className="text-text-secondary text-sm leading-none ">
            1 {fromToken?.metadata.symbol} = {mockReceiveAmount} {toToken?.metadata.symbol}{" "}
            {/* MOCK: Hardcoded USD value - replace with real price calculation */}
            <span className="text-[#BDBDBD]">{` ($69,420)`}</span>
          </span>
        </div>
      )}
    </div>
  );
};
