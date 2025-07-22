"use client";
import React, { useState } from "react";
import { formatAddress } from "@/services/utils/address";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";

enum SelectedWallet {
  MIDEN_WALLET = "miden-wallet",
  LOCAL_WALLET_1 = "local-wallet-1",
  LOCAL_WALLET_2 = "local-wallet-2",
}

const wallets = [
  {
    name: "Jessie01",
    address: "0xd...z23",
  },
  {
    name: "Jessie02",
    address: "0xd...s78",
  },
];

interface AccountProps {}

export const Account: React.FC<AccountProps> = () => {
  const { disconnect, publicKey } = useWallet();
  const [isBlurred, setIsBlurred] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet>(SelectedWallet.MIDEN_WALLET);

  const getCurrentAccountInfo = () => {
    switch (selectedWallet) {
      case SelectedWallet.MIDEN_WALLET:
        return {
          name: "Choose account",
          address: formatAddress(publicKey?.toString() || "0x"),
        };
      case SelectedWallet.LOCAL_WALLET_1:
        return wallets[0];
      case SelectedWallet.LOCAL_WALLET_2:
        return wallets[1];
      default:
        return {
          name: "Choose account",
          address: formatAddress(publicKey?.toString() || "0x"),
        };
    }
  };

  const currentAccount = getCurrentAccountInfo();

  const handleAccountClick = () => {
    // Find the account-info container and add blur effect
    const accountInfo = document.getElementById("account-info");
    if (accountInfo) {
      accountInfo.style.filter = "blur(4px)";
      accountInfo.style.transition = "filter 0.2s ease";
      setIsBlurred(true);

      // Add click listener to remove blur when clicking outside
      const handleOutsideClick = (event: MouseEvent) => {
        if (accountInfo && !accountInfo.contains(event.target as Node)) {
          setIsAnimatingOut(true);
          setTimeout(() => {
            accountInfo.style.filter = "none";
            setIsBlurred(false);
            setIsAnimatingOut(false);
            document.removeEventListener("click", handleOutsideClick);
          }, 200);
        }
      };

      // Add the listener after a small delay to prevent immediate trigger
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 100);
    }
  };

  return (
    <article
      className="flex flex-col w-full font-medium bg-white rounded-xl flex-1 cursor-pointer"
      onClick={handleAccountClick}
    >
      {/* Account Info */}
      <div
        id="account-info"
        className="flex-4/6 flex flex-col px-3 w-full text-blue-600 whitespace-nowrap justify-center align-middle"
      >
        <header className="flex items-center w-full text-sm font-medium tracking-tight">
          <div className="flex flex-1 gap-1 items-center">
            <img src="/miden-logo.svg" className="w-7 aspect-square" alt="miden logo icon" />
            <span className="text-base">{formatAddress(publicKey?.toString() || "0x")}</span>
            <img src="/copy-icon.svg" className="w-4 aspect-square" alt="Copy icon" />
          </div>
          <img
            onClick={() => disconnect()}
            src="/power-button.svg"
            className="w-5 aspect-square cursor-pointer"
            alt="power button icon"
          />
        </header>
        <div
          className={`flex relative gap-1 items-center w-full leading-tight ${
            selectedWallet !== SelectedWallet.MIDEN_WALLET && " pl-8"
          }`}
        >
          <div
            className={`flex flex-1 gap-0.5 items-center px-1.5 py-1 bg-blue-100 rounded-md ${
              selectedWallet === SelectedWallet.MIDEN_WALLET ? "text-center" : ""
            }`}
          >
            <span className="flex-1 text-base font-semibold tracking-tight">{currentAccount.name}</span>
            {selectedWallet !== SelectedWallet.MIDEN_WALLET && (
              <>
                <span className="text-sm font-medium tracking-tight">{currentAccount.address}</span>
                <img
                  src="/copy-icon.svg"
                  className="w-3.5 aspect-square"
                  alt="copy icon"
                  style={{
                    filter: "invert(32%) sepia(99%) saturate(749%) hue-rotate(186deg) brightness(98%) contrast(101%)",
                  }}
                />
              </>
            )}
          </div>
          <img src="/arrow/filled-arrow-right.svg" className="w-4 aspect-square" alt="filled arrow right icon" />
          {selectedWallet !== SelectedWallet.MIDEN_WALLET && (
            <img
              src="/connect-wallet-icon.svg"
              className="absolute -top-[1px] left-[11px] w-[22px] h-[22px] stroke-[1px] stroke-blue-600"
              alt="Status indicator"
            />
          )}
        </div>
      </div>

      {isBlurred && (
        <>
          {/* Miden wallet */}
          <div
            className={`flex absolute items-center leading-tight bottom-16 left-11 w-52 ${
              isAnimatingOut
                ? "animate-out slide-out-to-bottom-2 duration-200"
                : "animate-in slide-in-from-bottom-2 duration-300"
            } ease-out`}
            style={{
              opacity: 0,
              animation: isAnimatingOut
                ? "slideOutToTop 0.2s ease-out forwards"
                : "slideInFromTop 0.3s ease-out forwards",
            }}
            onClick={() => setSelectedWallet(SelectedWallet.MIDEN_WALLET)}
          >
            <div className="flex flex-1 gap-0.5 items-center px-1.5 py-1 bg-[white] rounded-lg border border-[#066EFF] shadow-lg">
              <img src="/miden-logo.svg" className="w-4 aspect-square" alt="wallet icon" />
              <span className="flex-1 text-base tracking-tight text-blue-600">Use your wallet</span>
            </div>
          </div>

          {/* Local wallet 1*/}
          <div
            className={`flex absolute  leading-tight bottom-26 left-11 w-52 -rotate-2 ${
              isAnimatingOut
                ? "animate-out slide-out-to-bottom-2 duration-200"
                : "animate-in slide-in-from-bottom-2 duration-300"
            } ease-out`}
            style={{
              opacity: 0,
              animation: isAnimatingOut
                ? "slideOutToTop 0.2s ease-out forwards"
                : "slideInFromTop 0.3s ease-out 0.1s forwards",
            }}
            onClick={() => setSelectedWallet(SelectedWallet.LOCAL_WALLET_1)}
          >
            <div className="flex justify-between flex-1 gap-0.5 items-center px-1.5 py-1 bg-[white] rounded-lg border border-[#066EFF] shadow-lg">
              <span className="flex-1 text-base tracking-tight text-blue-600">{wallets[0].name}</span>
              <span className="flex-1 text-base tracking-tight text-blue-600 text-right">{wallets[0].address}</span>
            </div>
          </div>

          {/* Local wallet 2*/}
          <div
            className={`flex absolute items-center leading-tight bottom-36 left-11 w-52 -rotate-4 ${
              isAnimatingOut
                ? "animate-out slide-out-to-bottom-2 duration-200"
                : "animate-in slide-in-from-bottom-2 duration-300"
            } ease-out`}
            style={{
              opacity: 0,
              animation: isAnimatingOut
                ? "slideOutToTop 0.2s ease-out forwards"
                : "slideInFromTop 0.3s ease-out 0.2s forwards",
            }}
            onClick={() => setSelectedWallet(SelectedWallet.LOCAL_WALLET_2)}
          >
            <div className="flex flex-1 gap-0.5 items-center px-1.5 py-1 bg-[white] rounded-lg border border-[#066EFF] shadow-lg">
              <span className="flex-1 text-base tracking-tight text-blue-600">{wallets[1].name}</span>
              <span className="flex-1 text-base tracking-tight text-blue-600 text-right">{wallets[1].address}</span>
            </div>
          </div>
        </>
      )}

      {/* Current Plan */}
      <div className="flex-2/6 flex gap-1.5 px-3  w-full bg-blue-700 justify-center items-center">
        <img src="/current-plan-icon.svg" className="w-6 aspect-square" alt="Plan icon" />
        <h2 className="flex-1 text-base font-medium text-white">Current Plan</h2>
        <div className="flex gap-2.5 items-center px-2 py-1 text-xs font-semibold tracking-tight leading-tight whitespace-nowrap bg-white rounded-lg text-neutral-950">
          <span>Free</span>
        </div>
      </div>
    </article>
  );
};

export default Account;
