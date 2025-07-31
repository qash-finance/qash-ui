"use client";
import React, { useState } from "react";
import { CreateCustomQRModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { ActionButton } from "../Common/ActionButton";
import BaseModal from "./BaseModal";
import { useForm } from "react-hook-form";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { AnyToken, AssetWithMetadata } from "@/types/faucet";
import { generateQRCode, saveQRToLocalStorage, generateQRName, generateQRData } from "@/services/utils/qrCode";
import toast from "react-hot-toast";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { useAccountContext } from "@/contexts/AccountProvider";

export function CreateCustomQRModal({
  isOpen,
  onClose,
  zIndex,
}: ModalProp<CreateCustomQRModalProps> & { zIndex?: number }) {
  const { register, handleSubmit, watch } = useForm();
  const { openModal } = useModal();
  const { accountId: walletAddress } = useAccountContext();

  //**********Local State**********
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Watch message field for real-time character count
  const message = watch("message") || "";

  //**********Handlers**********
  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);
    setSelectedTokenAddress(token.faucetId);
  };

  const handleGenerateQR = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const formData = watch();
      const amount = formData.amount;
      const message = formData.message;

      if (!selectedToken) {
        toast.error("Please select a token first");
        return;
      }

      const tokenSymbol = selectedToken.faucetId ? selectedToken.metadata.symbol : AnyToken.metadata.symbol;
      const tokenAddress = selectedToken.faucetId || AnyToken.faucetId;

      // Generate QR name based on token and amount
      const qrName = generateQRName(tokenSymbol, amount);

      // Generate QR data
      const qrData = generateQRData(tokenAddress, amount, message, walletAddress);

      // Create QR code instance
      const qrCode = generateQRCode(qrData);

      // Save to localStorage
      saveQRToLocalStorage({
        name: qrName,
        tokenAddress,
        tokenSymbol,
        amount,
        message,
        qrData,
      });

      // Show success message
      toast.success("QR code generated successfully", {
        duration: 2000,
      });

      onClose();
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error("Failed to generate QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Your Custom QR" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="flex flex-col gap-0">
        <div className="flex flex-col rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800 max-h-[800px] overflow-y-auto w-[500px] p-2">
          {/* Amount */}
          <div
            className="flex flex-col text-white rounded-xl justify-center items-center h-[200px]"
            style={{
              backgroundImage: "url('/modal/request-background.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <header className="flex flex-wrap  justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] flex-1 rounded-t-xl">
              <h2 className="text-white mt-0.5">Requesting</h2>
              <div className="flex gap-2 items-center text-sm font-medium leading-none">
                <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900">
                  <SelectTokenInput
                    selectedToken={selectedToken}
                    onTokenSelect={handleTokenSelect}
                    tokenAddress={selectedTokenAddress}
                  />
                </div>
              </div>
            </header>

            <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle flex-3/4 justify-center">
              <input
                className="text-white opacity-20 text-center outline-none"
                {...register("amount")}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.000000000000000001"
                autoComplete="off"
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]{0,2}$"
                onKeyDown={e => {
                  if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
          </div>

          <div className="flex gap-1 flex-row  items-center rounded-[10px] px-2 py-2 bg-[#292929] my-2">
            <div className="w-2 h-[0.1px] rotate-90 outline-[2px] outline-[#26A17B] rounded-full" />
            <img
              src={
                selectedToken?.faucetId === QASH_TOKEN_ADDRESS
                  ? "/q3x-icon.png"
                  : blo(turnBechToHex(selectedToken?.faucetId || ""))
              }
              alt="coin-icon"
              className="w-6 h-6"
            />
            <span className="text-white text-xl">
              {selectedToken?.faucetId ? selectedToken?.metadata.symbol : AnyToken.metadata.symbol}
            </span>
          </div>

          {/* Message */}
          <div
            className="flex flex-col text-white rounded-xl"
            style={{
              backgroundColor: "#1E1E1E",
            }}
          >
            <header className="flex flex-wrap gap-5 justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] rounded-t-xl">
              <h2 className="text-white mt-0.5">Message</h2>
              <h2 className="text-[#505050] mt-0.5">{message.length}/200</h2>
            </header>

            <div className="flex flex-col text-xl font-medium leading-none text-center align-middle row-span-5 p-2 bg-[#1E1E1E] rounded-b-xl border border-solid border-[#2D2D2D]">
              <textarea
                className="text-white opacity-20 outline-none text-base"
                {...register("message")}
                placeholder="Your message"
                rows={5}
                maxLength={200}
              />
            </div>
          </div>

          <div className="flex flex-row w-full gap-2 mt-2">
            <ActionButton text="Cancel" onClick={onClose} type="neutral" className="flex-1" disabled={isGenerating} />
            <ActionButton
              text={isGenerating ? "Generating..." : "Generate QR"}
              onClick={handleGenerateQR}
              className="flex-3/4"
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default CreateCustomQRModal;
