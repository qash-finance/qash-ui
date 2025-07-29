"use client";
import React, { useState, useEffect } from "react";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "../Common/ActionButton";
import { deployAccount, exportAccounts } from "@/services/utils/miden/account";
import toast from "react-hot-toast";
import { useWalletConnect, getLastConnectedAddress, getWalletAddresses } from "@/hooks/web3/useWalletConnect";

type Step = "init" | "creating" | "final";

interface LoadingBarProps {
  progress: number; // 0-100
  className?: string;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress, className = "" }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const width = `${clampedProgress}%`;

  return (
    <div className={`flex flex-row gap-2 items-center justify-start p-0 relative w-full ${className}`}>
      <div className="basis-0 bg-[#292929] flex flex-row grow h-10 items-center justify-start min-h-px min-w-px overflow-clip p-[6px] relative rounded shrink-0">
        <div
          className="bg-gradient-to-l from-[#caffef] h-full relative rounded shrink-0 to-[#416af9] via-[#6fb2f1]"
          style={{ width }}
        >
          <div
            className="absolute bg-[#b5e0ff] blur-[6px] filter h-10 rounded-[32px] top-[-4px] w-[7.373px]"
            style={{ right: "-3.686px" }}
          />
          <div
            className="absolute bg-[#cefffb] h-10 rounded-[32px] top-1/2 translate-y-[-50%] w-[3px]"
            style={{ right: "-1.5px" }}
          />
        </div>
      </div>
      <div className="font-['Barlow:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#fbfeff] text-[24px] text-right w-14">
        <p className="block leading-[normal]">{Math.round(clampedProgress)}%</p>
      </div>
    </div>
  );
};

export function ConnectWalletModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const [progress, setProgress] = useState(0);
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { handleCreateWallet, handleConnectExisting, handleImportWallet } = useWalletConnect();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("init");
      setProgress(0);
      setAccountId("");
      setIsImporting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchAccounts = () => {
      const accounts = getWalletAddresses();
      setAccounts(accounts);
      const lastConnected = getLastConnectedAddress();
      setLastConnectedAddress(lastConnected);
    };
    fetchAccounts();
  }, []);

  // Refresh accounts list when modal opens
  useEffect(() => {
    if (isOpen) {
      const accounts = getWalletAddresses();
      setAccounts(accounts);
      const lastConnected = getLastConnectedAddress();
      setLastConnectedAddress(lastConnected);
    }
  }, [isOpen]);

  const handleCreateClick = async () => {
    setCurrentStep("creating");
    setIsImporting(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    // at least wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    const accountId = await handleCreateWallet();

    if (accountId) {
      setAccountId(accountId);
    }

    setProgress(100);
    clearInterval(interval);

    setTimeout(() => {
      setCurrentStep("final");
    }, 1500);
  };

  const handleExportWallet = async () => {
    try {
      toast.loading("Exporting accounts...");

      // Get the store data from exportAccounts
      const storeData = await exportAccounts();

      // Format as JSON string (storeData is likely already a JSON string)
      const jsonContent = typeof storeData === "string" ? storeData : JSON.stringify(storeData, null, 2);

      // Create blob and download link
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create temporary link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `miden-accounts-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Accounts exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.dismiss();
      toast.error("Failed to export accounts");
    }
  };

  const handleImportClick = () => {
    // Create a hidden file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";

    fileInput.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Show creating step and start progress
          setCurrentStep("creating");
          setIsImporting(true);

          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                return 100;
              }
              return prev + 1;
            });
          }, 50);

          // at least wait for 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));

          const importedAddresses = await handleImportWallet(file);

          // Refresh the accounts list to include the newly imported wallets
          const updatedAccounts = getWalletAddresses();
          setAccounts(updatedAccounts);

          // Complete progress and show success
          setProgress(100);
          clearInterval(interval);

          // Wait a moment for user to see completion, then show wallet selection
          setTimeout(() => {
            setCurrentStep("init");
            setProgress(0);
            setIsImporting(false);
            toast.success(
              `${importedAddresses.length} wallet${importedAddresses.length > 1 ? "s" : ""} imported successfully`,
            );
          }, 1500);
        } catch (error) {
          setCurrentStep("init");
          setProgress(0);
          setIsImporting(false);
          toast.error("Failed to import wallet. Please check the file format.");
          console.error("Import error:", error);
        }
      }

      // Cleanup
      document.body.removeChild(fileInput);
    };

    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case "init":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            {accounts.length > 0 ? (
              <div className="flex flex-col gap-4 h-[300px] p-4">
                <h2 className="text-neutral-400 text-sm font-medium">Recently Connected Wallets</h2>
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {accounts.map((account, index) => (
                    <div
                      key={account}
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl hover:bg-neutral-700/50 transition-colors cursor-pointer"
                      onClick={async () => {
                        const connectedAddress = await handleConnectExisting(account);
                        if (connectedAddress) {
                          onClose();
                        }
                      }}
                    >
                      {/* Wallet Icon */}
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8H20V18ZM18 11H6V13H18V11Z" />
                        </svg>
                      </div>

                      {/* Wallet Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm truncate">
                            {account.slice(0, 6)}...{account.slice(-6)}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(account);
                              toast.success("Copied to clipboard");
                            }}
                            className="text-neutral-400 hover:text-white transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
                            </svg>
                          </button>
                        </div>
                        {account === lastConnectedAddress && (
                          <span className="text-green-400 text-xs font-medium">Last connected</span>
                        )}
                      </div>

                      {/* Export Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleExportWallet();
                        }}
                        className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-600/50"
                        title="Export wallet"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="relative flex flex-col gap-2 rounded-b-2xl h-full"
                style={{
                  background: "url('/modal/new-wallet-background.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className=" flex flex-col gap-2 h-[300px] rounded-b-2xl">
                  <div className="flex-1 flex items-center justify-center text-white">
                    <div className="flex flex-col items-center gap-2">
                      <img src="/modal/blue-wallet-icon.gif" alt="Wallet icon" className="w-15 h-15" />
                      <span className="text-2xl font-bold">Create or Import Your Wallet</span>
                      <span className="text-sm">Create or import a wallet to get started – it's quick and secure.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-row gap-2">
              <ActionButton text="Import" type="neutral" onClick={handleImportClick} className="flex-1" />
              <ActionButton text="Create" onClick={handleCreateClick} className="flex-1" />
            </div>
          </div>
        );

      case "creating":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div className="relative flex flex-col gap-2 rounded-2xl h-full bg-[#141416]">
              <div
                className=" flex flex-col gap-2 h-[300px] rounded-b-2xl"
                style={{
                  background: "url('/modal/sunshine.png')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  mixBlendMode: "lighten",
                }}
              >
                <div className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    {progress < 100 ? (
                      <>
                        <img src="/modal/new-wallet-spinner.gif" alt="Loading" className="w-15 h-15" />
                        <span className="text-2xl font-bold">
                          {isImporting ? "Importing Your Wallets" : "Creating Your Wallet"}
                        </span>
                        <span className="text-sm">
                          {isImporting
                            ? "Just a moment while we import your wallet data securely."
                            : "Just a moment while we set things up securely for you."}
                        </span>
                      </>
                    ) : (
                      <>
                        <img src="/modal/green-circle-check.gif" alt="green-circle-check" className="w-15 h-15" />
                        <span className="text-2xl font-bold">
                          {isImporting ? "Wallets Imported Successfully" : "Your Wallet is Ready"}
                        </span>
                        <span className="text-sm">You’re all set — your wallet has been created and secured.</span>
                      </>
                    )}
                  </div>
                  <img src="/modal/blue-spotlight.png" alt="Spotlight" className="absolute top-0  z-5" />
                  <img src="/modal/grid-wall.svg" alt="Grid wall" className="absolute bottom-0 z-0" />
                  {progress < 100 && (
                    <img
                      src="/modal/wave.gif"
                      alt="wave"
                      className="absolute -bottom-30 w-full mix-blend-lighten h-50 rotate-[355deg] scale-125"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="w-full ">
              <LoadingBar progress={progress} />
            </div>
          </div>
        );

      case "final":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            <div
              className="flex flex-col gap-2 rounded-b-2xl h-[300px] justify-center items-center"
              style={{
                background: "url('/modal/final-wallet-background.svg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative rounded-[20px] bg-black/10 backdrop-blur-[30px] flex flex-col items-center justify-center p-5 min-h-[200px] flex-wrap">
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background: "linear-gradient(45deg, #06FFB4, #88CEFF, #0059FF)",
                    padding: "2px",
                    zIndex: -1,
                  }}
                >
                  <div className="w-full h-full rounded-[18px] bg-black/85 backdrop-blur-[50px]" />
                </div>

                <div className="flex flex-col gap-2 items-center justify-center relative z-10 w-full max-w-[402px] px-4">
                  <p className="font-['Barlow:Regular',_sans-serif] text-white text-base text-center leading-tight">
                    Here is your wallet address
                  </p>

                  <p className="font-['Barlow:SemiBold',_sans-serif] text-white text-3xl text-center leading-tight tracking-[-0.64px] break-all">
                    {accountId}
                  </p>

                  <button
                    onClick={() => {
                      toast.success("Copied to clipboard");
                      navigator.clipboard.writeText(accountId);
                    }}
                    className="bg-[#edf8ff] cursor-pointer flex items-center gap-2.5 px-2 py-2 rounded-3xl hover:bg-[#d1e7ff] transition-colors"
                  >
                    <div className="w-3.5 h-3.5 relative">
                      <img alt="Copy" className="w-full h-full" src="/copy-icon.svg" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <ActionButton
                text="Export"
                type="neutral"
                onClick={() => setCurrentStep("creating")}
                className="flex-1"
              />
              <ActionButton
                text="Continue"
                onClick={() => {
                  onClose();
                }}
                className="flex-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect wallet" icon="/modal/wallet-icon.gif">
      {renderStepContent()}
    </BaseModal>
  );
}

export default ConnectWalletModal;
