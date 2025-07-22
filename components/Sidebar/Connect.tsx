"use client";
import * as React from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useAccount } from "@/contexts/AccountProvider";
import { useEffect, useState, useRef } from "react";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/miden-wallet-adapter-base";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter-reactui";
import Account from "./Account";

// Custom hook to safely render WalletMultiButton
const SafeWalletButton = ({ connected, style }: { connected: boolean; style: React.CSSProperties }) => {
  try {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        <WalletMultiButton
          style={{
            ...style,
            color: "transparent", // Hide original text
            fontSize: "0", // Hide text
          }}
          className="wallet-button-custom cursor-pointer"
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "16px",
            fontWeight: "500",
            pointerEvents: "none",
            zIndex: 10,
            width: "100%",
            textAlign: "center",
          }}
        >
          {connected ? "Disconnect" : "Connect Wallet"}
        </div>
      </div>
    );
  } catch (error) {
    console.error("WalletMultiButton error:", error);
    return (
      <button
        style={style}
        onClick={() => {
          // Fallback action - you might want to implement a manual connection flow here
          console.log("Fallback wallet connection");
        }}
      >
        {connected ? "Disconnect" : "Connect Wallet"}
      </button>
    );
  }
};

export const Connect = () => {
  const { connected, connecting, publicKey } = useWallet();
  const { connectWallet, isLoading, error, clearError, isAuthenticated } = useWalletAuth();
  const {
    deployAccountForWallet,
    deployedAccountData,
    isDeploying,
    error: deployError,
    switchToWalletAccount,
  } = useAccount();
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const hasAttemptedAuth = useRef(false);
  const hasAttemptedDeploy = useRef(false);
  const lastWalletAddress = useRef<string | null>(null);

  // Auto-deploy account and authenticate when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const deployAndAuthenticate = async () => {
        try {
          const walletAddress = publicKey.toString();
          console.log("🚀 ~ deployAndAuthenticate ~ walletAddress:", walletAddress);

          // Check if this is a different wallet than before
          if (lastWalletAddress.current && lastWalletAddress.current !== walletAddress) {
            console.log("Different wallet detected, switching accounts");
            setConnectionStatus("Switching accounts...");
          }

          lastWalletAddress.current = walletAddress;

          // Switch to the account for this wallet (loads existing or prepares for new)
          setConnectionStatus("Loading account...");
          await switchToWalletAccount(walletAddress);

          // Deploy account if needed (function handles existing account check internally)
          setConnectionStatus("Setting up account...");
          await deployAccountForWallet(walletAddress, true); // Deploy public account

          // Then authenticate
          if (!isAuthenticated) {
            setConnectionStatus("Authenticating...");
            await connectWallet(walletAddress);
          }

          setConnectionStatus("Successfully connected!");
          setTimeout(() => setConnectionStatus(""), 3000);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Connection failed";
          setConnectionStatus(`Error: ${errorMessage}`);
          setTimeout(() => setConnectionStatus(""), 8000);
          hasAttemptedDeploy.current = false; // Reset to allow retry
        }
      };

      deployAndAuthenticate();
    }

    // Reset the flags when wallet disconnects
    if (!connected) {
      hasAttemptedAuth.current = false;
      hasAttemptedDeploy.current = false;
      lastWalletAddress.current = null;
    }
  }, [connected, publicKey]);

  const buttonStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: "500",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    transition: "background-color 0.2s",
    textAlign: "center" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // If connected and authenticated, render Account component
  if (connected && isAuthenticated) {
    return <Account />;
  }

  return (
    <>
      <style jsx global>{`
        .wallet-button-custom {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
        }
        .wallet-button-custom > * {
          visibility: hidden !important;
        }
        .wallet-button-custom img {
          display: none !important;
        }
        .wallet-button-custom svg {
          display: none !important;
        }
        .wallet-button-custom span {
          display: none !important;
        }
        .wallet-button-custom div {
          display: none !important;
        }
      `}</style>

      <section className="overflow-hidden w-full font-medium bg-white rounded-xl h-[140px] flex items-center justify-center">
        <div className="flex flex-col justify-center w-full h-full">
          <div className="flex flex-col items-center w-full text-sm tracking-tight leading-none text-blue-600">
            <img src="/q3x-icon.svg" alt="Q3x" className="w-6 h-6 mb-2" />
            <p className="text-blue-600">Welcome to Q3x</p>
          </div>
          <div className="mt-1.5 w-full p-2">
            <SafeWalletButton
              connected={connected}
              style={{
                ...buttonStyle,
                backgroundColor: "#3b82f6",
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
};
