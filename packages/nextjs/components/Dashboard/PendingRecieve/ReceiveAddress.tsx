"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling, { Options } from "qr-code-styling";
import { ActionButton } from "@/components/Common/ActionButton";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { getQRsFromLocalStorage, generateQRCode } from "@/services/utils/qrCode";
import { CustomQRData } from "@/services/utils/qrCode";
import toast from "react-hot-toast";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

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
}) => {
  const { openModal } = useModal();
  const { walletAddress, isConnected } = useWalletConnect();

  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const [showQR, setShowQR] = useState(true);
  const [savedQRs, setSavedQRs] = useState<CustomQRData[]>([]);
  const [qrCodeInstances, setQrCodeInstances] = useState<Map<string, QRCodeStyling>>(new Map());
  const ref = useRef<HTMLDivElement>(null);
  const savedQRRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [options, setOptions] = useState<Options>({
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
  }, [options]);

  // Load saved QR codes
  useEffect(() => {
    const loadSavedQRs = () => {
      const qrs = getQRsFromLocalStorage();
      setSavedQRs(qrs);
    };

    loadSavedQRs();

    // Listen for storage changes to update when new QR codes are added
    const handleStorageChange = () => {
      loadSavedQRs();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Create QR code instances for saved QRs
  useEffect(() => {
    const newInstances = new Map<string, QRCodeStyling>();

    savedQRs.forEach(qr => {
      const qrCodeInstance = generateQRCode(qr.qrData);
      newInstances.set(qr.id, qrCodeInstance);
    });

    setQrCodeInstances(newInstances);
  }, [savedQRs]);

  // Append QR codes to their respective containers
  useEffect(() => {
    qrCodeInstances.forEach((qrCodeInstance, qrId) => {
      const container = savedQRRefs.current.get(qrId);
      if (container && container.children.length === 0) {
        qrCodeInstance.append(container);
      }
    });
  }, [qrCodeInstances]);

  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode?.update(options);
  }, [qrCode, options]);

  // Update QR code data when wallet address changes
  useEffect(() => {
    if (isConnected && walletAddress) {
      setOptions(prev => ({
        ...prev,
        data: walletAddress,
      }));
    }
  }, [isConnected, walletAddress]);

  const setQRRef = (qrId: string, element: HTMLDivElement | null) => {
    if (element) {
      savedQRRefs.current.set(qrId, element);
    } else {
      savedQRRefs.current.delete(qrId);
    }
  };

  // Refresh saved QR codes when component becomes visible
  const refreshSavedQRs = () => {
    const qrs = getQRsFromLocalStorage();
    setSavedQRs(qrs);
  };

  // Enhance onEnterAmount to refresh QRs after modal closes
  const handleEnterAmount = () => {
    if (onEnterAmount) {
      onEnterAmount();
      // Small delay to allow modal to process
      setTimeout(refreshSavedQRs, 100);
    }
  };

  // Handle clicking on a saved QR code
  const handleSavedQRClick = (qr: CustomQRData) => {
    setOptions(prev => ({
      ...prev,
      data: qr.qrData,
    }));
    setShowQR(true);
  };

  return (
    <main className="receive-address mx-auto rounded-2xl bg-neutral-700 w-full max-w-[380px] p-4 flex flex-col gap-4 h-full max-h-[800px]">
      {/* Header */}
      <header className="flex-col gap-2">
        <h1 className="text-lg font-medium leading-5 text-white">Receive Address</h1>
        <p className="text-sm tracking-tight leading-5 text-neutral-500">
          Use link or QR code below to receive tokens on Miden.
        </p>
      </header>

      {isConnected ? (
        <>
          {/* Address Display */}
          <section className=" gap-2 items-center p-2 bg-blue-600 rounded-xl ">
            <p className="overflow-hidden text-base font-medium leading-5 text-white flex-1 text-ellipsis whitespace-nowrap">
              {walletAddress || address}
            </p>
          </section>

          {/* QR Code Section */}
          <section className=" flex flex-col items-center relative">
            <div className="flex flex-col">
              <div ref={ref} className={`mx-auto ${showQR ? "block" : "hidden"}`} />
              <div
                className={`flex flex-row w-[350px] h-[348px] bg-transparent ${showQR && "hidden"} flex flex-wrap content-start gap-1 overflow-y-auto relative`}
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                }}
              >
                {savedQRs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <div className="flex justify-center items-center rounded-3xl border-white border-solid bg-neutral-950 border-[1.52px] h-28 w-28 transform cursor-pointer mb-2">
                      <img src="/q3x-qr-icon.svg" alt="No QR codes yet" className="w-16 h-16 opacity-50" />
                    </div>
                    <span className="text-white text-sm opacity-50">No saved QR codes</span>
                  </div>
                ) : (
                  savedQRs.map(qr => (
                    <div key={qr.id} className="flex flex-col items-center group relative">
                      <div className="relative">
                        <div
                          ref={el => setQRRef(qr.id, el)}
                          className="h-28 w-28 rounded-3xl overflow-hidden border-white border-solid border-[1.52px] bg-neutral-950 cursor-pointer hover:border-blue-500 transition-colors"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "15px",
                          }}
                          onClick={() => handleSavedQRClick(qr)}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-white text-xs truncate max-w-[70px]" title={qr.name}>
                          {qr.name}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {showQR ? (
                <>
                  <div className="mt-4 ml-4">
                    <ActionButton text="Enter an amount" type="neutral" onClick={handleEnterAmount} className="h-10" />
                  </div>
                  {/* Decorative QR Icons */}
                  <div
                    className="relative inset-0 cursor-pointer"
                    onClick={() => {
                      setShowQR(false);
                      refreshSavedQRs();
                    }}
                  >
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
            <ActionButton
              text="Save QR"
              type="neutral"
              onClick={() => {
                if (qrCode) {
                  qrCode.download({ name: `QASH-qr-${walletAddress?.slice(0, 8)}`, extension: "png" });
                }
              }}
              className="flex-1"
            />
            <ActionButton
              text="Copy Address"
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                toast.success("Address copied to clipboard");
              }}
              className="flex-1"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-2 flex-col w-[350px]">
            <div className="flex w-full h-[375px] justify-center items-center relative overflow-hidden">
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(/q3x-qr-icon.svg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(10px)",
                  opacity: 0.3,
                  zIndex: 0,
                }}
                aria-hidden="true"
              />
              <img
                src="/modal/qr-icon.gif"
                alt="Decorative QR code icon"
                className="w-16 h-16 relative z-10 grayscale"
              />
            </div>

            <span className="text-xl tracking-tight leading-5 text-white text-center">
              You'll see the QR code to your address after connect your wallet
            </span>

            <span className="text-sm tracking-tight leading-5 text-neutral-500 text-center">
              Don't have the wallet?{" "}
              <span
                className="text-white underline cursor-pointer"
                onClick={() => {
                  window.open(
                    "https://chromewebstore.google.com/detail/ablmompanofnodfdkgchkpmphailefpb?utm_source=item-share-cb",
                    "_blank",
                  );
                }}
              >
                Download it here
              </span>
            </span>
          </div>

          <ActionButton
            text="Connect Wallet"
            onClick={() => {
              openModal(MODAL_IDS.CONNECT_WALLET);
            }}
          />
        </>
      )}
    </main>
  );
};

export default ReceiveAddress;
