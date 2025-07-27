"use client";

import React, { useState } from "react";
import { OnboardingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { AssetWithMetadata } from "@/types/faucet";
import { qashTokenAddress, qashTokenDecimals, qashTokenMaxSupply } from "@/services/utils/constant";
import { ActionButton } from "../Common/ActionButton";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { useWalletState } from "@/services/store";
import { useAccount } from "@/hooks/web3/useAccount";
import { AccountId } from "@demox-labs/miden-sdk";
import { mintToken } from "@/services/utils/faucet";
import { STORAGE_KEY } from "@/contexts/AccountProvider";

// Create QASH token data
const qashToken: AssetWithMetadata = {
  tokenAddress: qashTokenAddress,
  amount: "0", // Default amount if user doesn't have any
  metadata: {
    symbol: "QASH",
    decimals: qashTokenDecimals,
    maxSupply: qashTokenMaxSupply,
  },
};

export function OnboardingModal({ isOpen, onClose }: ModalProp<OnboardingModalProps>) {
  const { walletAddress } = useWalletState(state => state);
  const { accountId } = useAccount(walletAddress);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMintToken = async () => {
    setLoading(true);
    try {
      const accountIdHex = AccountId.fromBech32(accountId);
      const faucetIdHex = AccountId.fromBech32(qashToken.tokenAddress);
      await mintToken(accountIdHex.toString(), faucetIdHex.toString(), 1000);

      // Set hasClaimQASH to true in localStorage after successful mint
      const deployedAccounts = localStorage.getItem(STORAGE_KEY);
      if (deployedAccounts) {
        try {
          const accounts = JSON.parse(deployedAccounts);
          const walletAddress = Object.keys(accounts)[0]; // Get the first wallet address
          if (accounts[walletAddress]) {
            accounts[walletAddress].hasClaimQASH = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
          }
        } catch (error) {
          console.error("Error updating hasClaimQASH in localStorage:", error);
        }
      }

      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Welcome to Qash testnet!" icon="/modal/coin-icon.gif">
      <div
        className="flex flex-col items-center rounded-b-2xl border border-solid bg-stone-900 border-zinc-800 w-[450px] relative overflow-hidden"
        style={{
          backgroundImage: "url(/modal/onboard-background.svg)",
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/30 rounded-full w-100 h-100 blur-3xl" />

        {/* Blue glow effect at the top */}
        <main className="flex flex-col gap-6 items-center self-stretch p-3 z-10">
          {/* Token Icon and Info */}
          <div className="flex flex-col gap-4 items-center">
            <img src="/token/qash.svg" alt="QASH Token" className="w-16 h-16" />
            <div className="flex flex-col gap-2 items-center">
              <span className="text-5xl font-bold text-white">1000</span>
              <span className="text-xl text-white text-center">
                Grab your free test tokens to start exploring Qash on testnet.
              </span>
              <p className="text-sm text-neutral-500">Click below to claim your free tokens</p>
            </div>
          </div>

          {/* Action Button */}
          {loading ? (
            <ActionButton text="■ ■ ■" onClick={() => {}} className="w-full h-10 animate-pulse" disabled />
          ) : success ? (
            <ActionButton
              text="Ready to Claim!"
              onClick={() => {
                onClose();
              }}
              className="w-full h-10"
            />
          ) : (
            <ActionButton text="Request free tokens" onClick={() => handleMintToken()} className="w-full h-10" />
          )}
        </main>
      </div>
    </BaseModal>
  );
}

export default OnboardingModal;
