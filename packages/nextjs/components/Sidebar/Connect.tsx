"use client";
import * as React from "react";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useEffect } from "react";
import Account from "./Account";
import { useWalletState } from "@/services/store";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { BUTTON_STYLES } from "@/services/utils/constant";

// Custom hook to safely render WalletMultiButton
const SafeWalletButton = ({
  connected,
  style,
  onClick,
}: {
  connected: boolean;
  style: React.CSSProperties;
  onClick: () => void;
}) => {
  try {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        {/* <WalletMultiButton
          onClick={onClick}
          style={{
            ...style,
            color: "transparent", // Hide original text
            fontSize: "0", // Hide text
          }}
          className="wallet-button-custom cursor-pointer"
        /> */}
        <button
          onClick={onClick}
          style={{
            ...style,
            color: "transparent", // Hide original text
            fontSize: "0", // Hide text
          }}
          className="wallet-button-custom cursor-pointer h-[40px]"
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
          className="wallet-button-custom cursor-pointer"
        >
          Connect Wallet
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
  // **************** Global State *******************
  const { isConnected, setIsConnected, setFirstTimeConnected, firstTimeConnected } = useWalletState(state => state);
  const { handleConnect, walletAddress } = useWalletConnect();
  const { openModal } = useModal();

  // **************** Custom Hooks *******************
  const { connectWallet, isAuthenticated } = useWalletAuth();

  // **************** Local State *******************

  // **************** Effects *******************
  // Auto connect if wallet address exists in local storage
  useEffect(() => {
    if (!isConnected && walletAddress && !firstTimeConnected) {
      setIsConnected(true);
      setFirstTimeConnected(true);
    }
  }, [isConnected, walletAddress]);

  // Auto-deploy local authentication account and authenticate when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      const deployAndAuthenticate = async () => {
        try {
          // server side authentication
          // generate local keypair for signing message

          // Then authenticate
          if (!isAuthenticated) {
            await connectWallet(walletAddress);
          }
        } catch (error) {}
      };

      deployAndAuthenticate();
    }
  }, [isConnected, walletAddress]);

  // If connected and authenticated, render Account component
  if (isConnected && isAuthenticated) {
    return <Account />;
  }

  return (
    <div>
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
            <img src="/qash-icon.svg" alt="Qash" className="w-6 h-6 mb-2" />
            <p className="text-blue-600">Welcome to Qash</p>
          </div>
          <div className="mt-1.5 w-full p-2">
            <SafeWalletButton
              onClick={async () => {
                // await handleConnect().then(() => {
                // const deployedAccounts = localStorage.getItem(STORAGE_KEY);
                // if (deployedAccounts) {
                //   try {
                //     const accounts = JSON.parse(deployedAccounts);
                //     const account = Object.values(accounts)[0] as any;
                //     const hasClaimQASH = account.hasClaimQASH;
                //     // Only open modal if user hasn't claimed QASH
                //     if (!hasClaimQASH) {
                //       openModal(MODAL_IDS.ONBOARDING);
                //     }
                //   } catch (error) {
                //     console.error("Error parsing deployed accounts:", error);
                //   }
                // }
                // });
                openModal(MODAL_IDS.CONNECT_WALLET);
              }}
              connected={isConnected}
              style={{
                ...BUTTON_STYLES,
                backgroundColor: "#3b82f6",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
