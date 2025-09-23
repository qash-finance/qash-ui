"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling, { Options } from "qr-code-styling";
import { useAccountContext } from "@/contexts/AccountProvider";
import toast from "react-hot-toast";

export const Receive = () => {
  const { accountId: walletAddress } = useAccountContext();
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const qrRef = useRef<HTMLDivElement>(null);

  // Default address for display when wallet is not connected
  const displayAddress = walletAddress || "0x2A098898990628505749aBe334547B3f0D0d0F75";

  const qrOptions: Options = {
    width: 200,
    height: 200,
    type: "svg",
    data: displayAddress,
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    dotsOptions: {
      type: "dots",
      color: "var(--primary-blue)",
    },
    backgroundOptions: {
      color: "transparent",
    },
    image: "/logo/qash-icon.svg",
    cornersDotOptions: {
      type: "extra-rounded",
      color: "var(--primary-blue)",
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "var(--primary-blue)",
    },
  };

  useEffect(() => {
    setQrCode(new QRCodeStyling(qrOptions));
  }, [displayAddress]);

  useEffect(() => {
    if (qrRef.current && qrCode) {
      qrRef.current.innerHTML = "";
      qrCode.append(qrRef.current);
    }
  }, [qrCode]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(displayAddress);
      toast.success("Address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy address:", error);
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className=" flex flex-col gap-6 items-center justify-center relative mt-6">
      {/* Warning Banner */}
      <div className="bg-[#ff5500] rounded-none px-4 py-2 flex gap-3 items-center w-full">
        <img src="/logo/miden.svg" alt="warning" className="w-6" />
        <span className="text-white text-sm">
          This is address of Miden testnet, deposit from other blockchain will not work
        </span>
      </div>

      {/* QR Code Container */}
      <div className="p-2 bg-app-background rounded-4xl border-1 border-primary-divider">
        <div className="bg-background rounded-4xl border-2 border-primary-divider">
          <div ref={qrRef} className="w-full h-full rounded-4xl" />
        </div>
      </div>

      {/* Address Input */}
      <div className="w-full p-4">
        <div className="flex items-center px-4 py-2 w-full bg-background rounded-xl border-b-2 border-primary-divider">
          <div className="flex flex-col flex-1">
            <p className="text-text-secondary text-sm font-medium">Address</p>
            <p className="text-text-primary text-base font-medium truncate">{displayAddress}</p>
          </div>
          <button
            onClick={handleCopyAddress}
            className="flex items-center justify-center px-4 py-2 rounded-[10px] bg-background border border-primary-divider shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.3),0px_0px_0px_1px_#e6e6e6] cursor-pointer outline-none"
          >
            <span className="text-text-primary text-sm font-semibold text-center">Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
