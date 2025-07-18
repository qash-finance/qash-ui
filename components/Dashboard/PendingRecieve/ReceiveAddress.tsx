"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling, { Options } from "qr-code-styling";
import { ActionButton } from "@/components/Common/ActionButton";

interface ReceiveAddressProps {
  address?: string;
  qrCodeUrl?: string;
  onEnterAmount?: () => void;
  onSaveQR?: () => void;
  onCopyAddress?: () => void;
}

export const ReceiveAddress: React.FC<ReceiveAddressProps> = ({
  address = "0x137f06b5b832592900253730d5a5ad01c456...",
  onEnterAmount,
  onSaveQR,
  onCopyAddress,
}) => {
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const [showQR, setShowQR] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const [options] = useState<Options>({
    width: 350,
    height: 350,
    type: "svg",
    data: address,
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    dotsOptions: {
      type: "extra-rounded",
      color: "white",
    },
    backgroundOptions: {
      color: "transparent",
    },
  });

  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
  }, []);

  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode?.update(options);
  }, [qrCode, options]);

  return (
    <main className="mx-auto rounded-2xl bg-neutral-700 w-full max-w-[380px] p-4 flex flex-col gap-4 h-full max-h-[800px]">
      {/* Header */}
      <header className="flex-col gap-2">
        <h1 className="text-lg font-medium leading-5 text-white">Receive Address</h1>
        <p className="text-sm tracking-tight leading-5 text-neutral-500">
          Use link or QR code below to receive tokens on Miden.
        </p>
      </header>

      {/* Address Display */}
      <section className=" gap-2 items-center p-2 bg-blue-600 rounded-xl ">
        <p className="overflow-hidden text-base font-medium leading-5 text-white flex-1 text-ellipsis whitespace-nowrap">
          {address}
        </p>
      </section>

      {/* QR Code Section */}
      <section className=" flex flex-col items-center relative">
        <div className="flex flex-col">
          <div ref={ref} className={`mx-auto ${showQR ? "block" : "hidden"}`} />
          <div
            className={`flex justify-between flex-row gap-2 w-[350px] h-[350px] bg-transparent ${showQR ? "hidden" : "block"}`}
          >
            <div className="flex justify-center items-center rounded-3xl border-white border-solid bg-neutral-950 border-[1.52px] h-28 w-28 transform cursor-pointer">
              <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-35 h-35" />
            </div>
            <div className="flex justify-center items-center rounded-3xl border-white border-solid bg-neutral-950 border-[1.52px] h-28 w-28 transform cursor-pointer">
              <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-35 h-35" />
            </div>
            <div className="flex justify-center items-center rounded-3xl border-white border-solid bg-neutral-950 border-[1.52px] h-28 w-28 transform cursor-pointer">
              <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-35 h-35" />
            </div>
          </div>

          {showQR ? (
            <>
              <div className="mt-4 ml-4">
                <ActionButton text="Enter an amount" type="neutral" onClick={onEnterAmount} className="h-10" />
              </div>
              {/* Decorative QR Icons */}
              <div className="relative inset-0 cursor-pointer" onClick={() => setShowQR(false)}>
                <div className="absolute bottom-0 right-20 flex justify-center items-center rounded-lg border-white border-solid bg-neutral-950 border-[1.52px] h-10 w-10 transform -rotate-3 z-[1] cursor-pointer">
                  <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-10 h-10" />
                </div>
                <div className="absolute bottom-0 right-16 flex justify-center items-center rounded-lg border-white border-solid bg-neutral-950 border-[1.52px] h-10 w-10 transform rotate-6 z-[2] cursor-pointer">
                  <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-10 h-10" />
                </div>
                <div className="absolute bottom-0 right-12 flex justify-center items-center rounded-lg border-white border-solid bg-neutral-950 border-[1.52px] h-10 w-10 transform -rotate-3 z-[3] cursor-pointer">
                  <img src="/q3x-qr-icon.svg" alt="Decorative QR code icon" className="w-10 h-10" />
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto mt-4">
              <ActionButton text="Go Back" type="neutral" onClick={() => setShowQR(true)} className="h-10" />
            </div>
          )}
        </div>
      </section>

      {/* Notice Section */}
      <section className="flex flex-col gap-2 mt-auto">
        <h3 className="text-base font-medium leading-5 text-white">Notice:</h3>
        <div className="text-md leading-4 text-neutral-400">
          <ul className="flex flex-col gap-4 list-none">
            <li>
              • This is the address of your Account. Deposit funds by scanning the QR code or copying the address.
            </li>
            <li>• Only send tokens on Miden. We're not responsible for your token loss.</li>
          </ul>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto w-full">
        <ActionButton text="Save QR" type="neutral" onClick={onSaveQR} className="flex-1" />
        <ActionButton text="Copy Address" onClick={onCopyAddress} className="flex-1" />
      </div>
    </main>
  );
};

export default ReceiveAddress;
