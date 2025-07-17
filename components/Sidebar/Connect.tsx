"use client";
import * as React from "react";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
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
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const hasAttemptedAuth = useRef(false);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !hasAttemptedAuth.current) {
      hasAttemptedAuth.current = true;

      const authenticateWallet = async () => {
        try {
          // Convert publicKey to string format expected by your auth system
          const walletAddress = publicKey.toString();
          await connectWallet(walletAddress);

          setConnectionStatus("Successfully authenticated!");
          setTimeout(() => setConnectionStatus(""), 3000);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Authentication failed";
          setConnectionStatus(`Error: ${errorMessage}`);
          setTimeout(() => setConnectionStatus(""), 8000);
          hasAttemptedAuth.current = false; // Reset to allow retry
        }
      };

      authenticateWallet();
    }

    // Reset the flag when wallet disconnects
    if (!connected) {
      hasAttemptedAuth.current = false;
    }
  }, [connected, publicKey, isAuthenticated]);

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

      <section className="overflow-hidden w-full font-medium bg-white rounded-xl h-[130px] flex items-center justify-center">
        <div className="flex flex-col justify-center py-2.5 w-full">
          {!connected ? (
            <>
              <div className="flex flex-col items-center w-full text-sm tracking-tight leading-none text-blue-600">
                <img src="/q3x-icon.svg" alt="Q3x" className="w-6 h-6 mb-2" />
                <p className="text-blue-600">Welcome to Q3x</p>
              </div>
              <div className="mt-1.5 w-full">
                <SafeWalletButton
                  connected={connected}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#3b82f6",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center w-full text-sm tracking-tight leading-none text-green-600">
                <Account />
              </div>
              {/* <div className="mt-1.5 w-full">
                <SafeWalletButton 
                  connected={connected}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ef4444',
                  }}
                />
              </div> */}
            </>
          )}
        </div>
      </section>
    </>
  );
};
