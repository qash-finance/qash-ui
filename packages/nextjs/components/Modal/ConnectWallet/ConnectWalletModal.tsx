"use client";
import React, { useState, useEffect } from "react";
import { MODAL_IDS, ConnectWalletModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "../../Common/ActionButton";
import { exportAccounts } from "@/services/utils/miden/account";
import toast from "react-hot-toast";
import { useWalletConnect, getLastConnectedAddress, getWalletAddresses } from "@/hooks/web3/useWalletConnect";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useTour } from "@reactour/tour";
import { TOUR_SKIPPED_KEY } from "@/services/utils/constant";
import { usePathname, useRouter } from "next/navigation";
import { useCreateDefaultGroup } from "@/services/api/group-payment";
import { CreateGroupDto } from "@/types/group-payment";
import { LoadingBar } from "../../Common/LoadingBar";

type Step = "init" | "creating" | "final";

export function ConnectWalletModal({ isOpen, onClose, zIndex }: ModalProp<ConnectWalletModalProps>) {
  // **************** Custom Hooks *******************
  const { openModal } = useModal();
  const { handleCreateWallet, handleConnectExisting, handleImportWallet } = useWalletConnect();
  const { connectWallet } = useWalletAuth();
  const { mutate: createGroup } = useCreateDefaultGroup();
  const router = useRouter();
  const pathname = usePathname();

  // **************** Local State *******************
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const [progress, setProgress] = useState(0);
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [filesToImport, setFilesToImport] = useState<File[]>([]);

  const { setIsOpen } = useTour();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("init");
      setProgress(0);
      setAccountId("");
      setIsImporting(false);
      setFilesToImport([]);
    }
  }, [isOpen]);

  // Handle files from ImportWallet modal
  useEffect(() => {
    if (filesToImport.length > 0) {
      handleImportFiles(filesToImport);
      setFilesToImport([]);
    }
  }, [filesToImport]);

  useEffect(() => {
    const fetchAccounts = () => {
      const accounts = getWalletAddresses();
      setAccounts(accounts);
      const lastConnected = getLastConnectedAddress();
      setLastConnectedAddress(lastConnected);
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const accounts = getWalletAddresses();
      setAccounts(accounts);
      const lastConnected = getLastConnectedAddress();
      setLastConnectedAddress(lastConnected);
    }
  }, [isOpen]);

  // Function to create default "Quick Share" group
  const createQuickShareGroup = async () => {
    try {
      const quickShareGroup: CreateGroupDto = {
        name: "Quick Share",
        members: [], // Add the new account as a member
      };

      createGroup(quickShareGroup, {
        onSuccess: () => {
          console.log("Default Quick Share group created successfully");
        },
        onError: error => {
          console.error("Failed to create default Quick Share group:", error);
          // Don't show error toast to user as this is a background operation
        },
      });
    } catch (error) {
      console.error("Error creating default Quick Share group:", error);
    }
  };

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
      // Authenticate the newly created wallet
      try {
        await connectWallet(accountId);
        // Create default "Quick Share" group after successful authentication
        await createQuickShareGroup();
      } catch (error) {
        console.error("Failed to authenticate new wallet:", error);
        // Continue anyway since wallet was created successfully
      }
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

  const handleImportFiles = async (files: File[]) => {
    try {
      // Show creating step and start progress
      setCurrentStep("creating");
      setIsImporting(true);
      setProgress(0);

      // Process each file
      let totalImportedAddresses = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = file.name.toLowerCase().split(".").pop();

        // Simulate progress for each file
        const fileProgress = (i / files.length) * 100;
        const interval = setInterval(() => {
          setProgress(prev => {
            const targetProgress = fileProgress + ((i + 1) / files.length) * 100;
            if (prev >= targetProgress) {
              clearInterval(interval);
              return targetProgress;
            }
            return prev + 2;
          });
        }, 50);

        // Process file based on extension
        if (extension === "json") {
          const importedAddresses = await handleImportWallet(file);
          totalImportedAddresses += importedAddresses.length;
        } else {
          // For xlsx and csv files, we would need additional processing
          clearInterval(interval);
          toast.error("Currently only JSON wallet files are supported. XLSX and CSV support coming soon.");
          setCurrentStep("init");
          setProgress(0);
          setIsImporting(false);
          return;
        }

        clearInterval(interval);
        // Wait a moment between files
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Refresh the accounts list to include the newly imported wallets
      const updatedAccounts = getWalletAddresses();
      setAccounts(updatedAccounts);

      // Complete progress and show success
      setProgress(100);

      // Wait a moment for user to see completion, then show wallet selection
      setTimeout(() => {
        setCurrentStep("init");
        setProgress(0);
        setIsImporting(false);
        toast.success(`${totalImportedAddresses} wallet${totalImportedAddresses > 1 ? "s" : ""} imported successfully`);
      }, 1500);
    } catch (error) {
      setCurrentStep("init");
      setProgress(0);
      setIsImporting(false);
      toast.error("Failed to import wallet. Please check the file format.");
      console.error("Import error:", error);
    }
  };

  const handleImportFromModal = (files: File[]) => {
    setFilesToImport(files);
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case "init":
        return (
          <div className="flex flex-col gap-2 w-[600px] p-2 bg-[#1E1E1E] rounded-b-2xl">
            {accounts.length > 0 ? (
              <div
                style={{
                  backgroundImage: "url('/connect-wallet/bg.png')",
                  backgroundSize: "cover",
                }}
                className="flex flex-col gap-4 h-[300px] p-4 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-neutral-400 text-sm font-medium">Recently Connected Wallets</h2>
                  <img
                    src="/modal/reset-icon.svg"
                    alt=""
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => openModal(MODAL_IDS.RESET_ACCOUNT)}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {accounts.map((account, index) => (
                    <div
                      key={account}
                      className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-xl cursor-pointer"
                      onClick={async () => {
                        try {
                          // First connect the wallet
                          const connectedAddress = await handleConnectExisting(account);
                          if (connectedAddress) {
                            // Then authenticate with the selected account
                            await connectWallet(connectedAddress);
                            onClose();
                          }
                        } catch (error) {
                          console.error("Account switch error:", error);
                          toast.error("Failed to switch account");
                        }
                      }}
                    >
                      {/* Wallet Icon */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <img src="/connect-wallet/wallet-item.svg" alt="" className="scale-105" />
                      </div>

                      {/* Wallet Details */}
                      <div className="cursor-pointer flex gap-5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">
                            {account.slice(0, 6)}...{account.slice(-6)}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(account);
                              toast.success("Copied to clipboard");
                            }}
                            className="cursor-pointer text-neutral-400 hover:text-white transition-colors"
                          >
                            <img src="/connect-wallet/copy-icon.svg" alt="" className="text-[#989898]" />
                          </button>
                        </div>
                        <div>
                          {account === lastConnectedAddress && (
                            <span className="text-[#0059FF] bg-[#D6EDFF] text-xs px-3 py-1.5 rounded-xl font-medium">
                              Recently Used
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        // onClick={e => {
                        //   e.stopPropagation();
                        //   handleExportWallet();
                        // }}
                        className="text-neutral-400 p-2 rounded-lg cursor-pointer"
                        title="Export wallet"
                      >
                        <img src={"/connect-wallet/arrow-right.svg"} />
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
              {accounts.length > 0 && (
                <ActionButton text="Export" type="neutral" onClick={handleExportWallet} className="flex-1" />
              )}
              <ActionButton
                text="Import"
                type={accounts.length > 0 ? undefined : "neutral"}
                onClick={() => openModal(MODAL_IDS.IMPORT_WALLET, { onImport: handleImportFromModal })}
                className="flex-1"
              />
              {accounts.length == 0 && <ActionButton text="Create" onClick={handleCreateClick} className="flex-1" />}
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
                backgroundImage: "url('/modal/final-wallet-background.svg')",
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
                text="Continue"
                onClick={() => {
                  onClose();

                  // if first time, then open this
                  // const isTourSkipped = localStorage.getItem(TOUR_SKIPPED_KEY);
                  // if (!isTourSkipped) {
                  //   pathname !== "/" && router.push("/");
                  //   setIsOpen(true);
                  // }
                }}
                className="flex-1 w-full"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect wallet"
      icon="/modal/wallet-icon.gif"
      actionButtonIcon="/plus.png"
      currentStep={currentStep}
      handleCreateClick={handleCreateClick}
      showCreateButton={accounts.length > 0 && currentStep === "init"}
      zIndex={zIndex}
    >
      {renderStepContent()}
    </BaseModal>
  );
}

export default ConnectWalletModal;
