import React, { useState } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatAddress } from "@/services/utils/miden/address";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Badge, BadgeStatus } from "../Common/Badge";
import { toast } from "react-hot-toast";
import { AssetWithMetadata } from "@/types/faucet";
import { useWalletState } from "@/services/store";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { useAuth } from "@/services/auth/context";
import { AuthMeResponse } from "@/services/auth/api";
import { useMidenProvider } from "@/contexts/MidenProvider";

const SubIcon = ({
  icon,
  onClick,
  tooltipId,
  tooltipContent,
  className,
}: {
  icon: string;
  onClick: () => void;
  tooltipId?: string;
  tooltipContent?: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex justify-center items-center w-[28px] h-[28px] rounded-lg bg-app-background border-t-2 border-primary-divider cursor-pointer ${className}`}
      onClick={() => {
        onClick();
      }}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >
      <img src={icon} className="w-4" alt={icon} />
    </div>
  );
};

interface PaymentLinkPreviewProps {
  recipient: string;
  paymentWalletAddress: string;
  amount: string;
  title: string;
  description: string;
  selectedToken: AssetWithMetadata | null;
  handleSubmitPayment?: () => void;
  handleConnectWallet?: () => void;
  isSending?: boolean;
}

export const PaymentLinkPreview = ({
  recipient,
  paymentWalletAddress,
  amount,
  title,
  description,
  selectedToken,
  handleSubmitPayment,
  handleConnectWallet,
  isSending,
}: PaymentLinkPreviewProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  console.log("🚀 ~ PaymentLinkPreview ~ isAuthenticated:", isAuthenticated);
  const { address: walletAddress } = useMidenProvider();
  const [isQRCodeCollapsed, setIsQRCodeCollapsed] = useState(true);
  const [isWalletAddressCollapsed, setIsWalletAddressCollapsed] = useState(false);
  return (
    <>
      <BaseContainer
        header={
          <header className="flex items-center w-full justify-between px-5 py-2">
            <div className="flex flex-1 gap-2 items-center">
              <img
                src={blo(turnBechToHex(walletAddress || ""))}
                alt="Recipient avatar"
                className="w-[24px] rounded-full"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm truncate text-text-primary leading-none">{recipient}</span>
                  <img src="/logo/miden.svg" className="w-4" alt="miden logo icon" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm truncate text-text-secondary leading-none">
                    {formatAddress(paymentWalletAddress || "0x")}
                  </span>
                  <img
                    src="/misc/copy-icon.svg"
                    className="w-4 cursor-pointer"
                    alt="copy icon"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress || "");
                      toast.success("Copied to clipboard");
                    }}
                  />
                </div>
              </div>
            </div>
          </header>
        }
        containerClassName="w-full h-full border-1 border-[#D4D6D9]"
      >
        <div className="w-full h-full flex flex-row gap-2 p-3">
          {/* Pay with */}
          <div className="flex flex-col gap-2 bg-background rounded-xl p-3 w-[50%]">
            <span className="text-text-primary text-lg font-semibold">Pay with</span>

            {/* Collapsible Scan QR Code Section */}
            <div className="border border-primary-divider rounded-xl overflow-hidden p-3">
              {/* Collapsible Header */}
              <div
                className="flex items-center justify-between cursor-not-allowed hover:bg-white/5 transition-colors"
                // INFO: Uncomment this to enable the collapsible section
                // onClick={() => {
                //   setIsQRCodeCollapsed(!isQRCodeCollapsed);
                //   setIsWalletAddressCollapsed(true);
                // }}
              >
                <div className="flex items-center gap-3">
                  <SubIcon icon="/misc/qr-icon.svg" onClick={() => {}} className="!cursor-not-allowed" />
                  <span className="text-text-primary text-xl font-semibold">Scan QR Code</span>
                  <Badge status={BadgeStatus.SUCCESS} text="Coming soon" />
                </div>
                <img
                  src="/arrow/chevron-down.svg"
                  alt="Toggle"
                  className={`w-5 h-5 transition-transform duration-200 ${isQRCodeCollapsed ? "rotate-180" : ""}`}
                />
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isQRCodeCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100 mt-3"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Network Selection */}
                  <div className="flex flex-col gap-1">
                    <p className="text-text-secondary text-xs font-medium">Network</p>
                    <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center px-4 py-3">
                      <div className="flex items-center gap-2 flex-1">
                        <img src="/chain/miden.svg" alt="Miden" className="w-7 h-7 rounded-full" />
                        <span className="text-text-primary">Miden Testnet</span>
                      </div>
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      {selectedToken?.metadata.symbol ? (
                        <>
                          <img
                            alt=""
                            className="w-5 h-5"
                            src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                          />
                          <span className="text-text-primary">{selectedToken.metadata.symbol}</span>
                        </>
                      ) : (
                        <span className="text-text-primary">Select token</span>
                      )}
                    </div>
                    <img src="/arrow/chevron-down.svg" alt="Dropdown" className="w-5 h-5" />
                  </div>

                  {/* Amount Input */}
                  <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
                    <div className="flex flex-col gap-1 px-4 py-2">
                      <label className="text-text-secondary text-sm font-medium">Amount</label>
                      <input
                        placeholder="Enter amount"
                        value={amount || ""}
                        className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                        autoComplete="off"
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Connect Wallet Button */}
                  <div className="flex justify-center">
                    <PrimaryButton text="Connect Wallet" onClick={() => {}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Wallet Address Section */}
            <div className="border border-primary-divider rounded-xl overflow-hidden p-3">
              {/* Collapsible Header */}
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => {
                  setIsWalletAddressCollapsed(!isWalletAddressCollapsed);
                  setIsQRCodeCollapsed(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <SubIcon icon="/misc/dark-wallet-icon.svg" onClick={() => {}} />
                  <span className="text-text-primary text-xl font-semibold">Wallet Address</span>
                </div>
                <img
                  src="/arrow/chevron-down.svg"
                  alt="Toggle"
                  className={`w-5 h-5 transition-transform duration-200 ${isWalletAddressCollapsed ? "rotate-180" : ""}`}
                />
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isWalletAddressCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100 mt-3"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Network Selection */}
                  <div className="flex flex-col gap-1">
                    <p className="text-text-secondary text-xs font-medium">Network</p>
                    <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center px-4 py-3">
                      <div className="flex items-center gap-2 flex-1">
                        <img src="/chain/miden.svg" alt="Miden" className="w-7 h-7 rounded-full" />
                        <span className="text-text-primary">Miden Testnet</span>
                      </div>
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      {selectedToken?.metadata.symbol ? (
                        <>
                          <img
                            alt=""
                            className="w-5 h-5"
                            src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                          />
                          <span className="text-text-primary">{selectedToken.metadata.symbol}</span>
                        </>
                      ) : (
                        <span className="text-text-primary">Select token</span>
                      )}
                    </div>
                    <img src="/arrow/chevron-down.svg" alt="Dropdown" className="w-5 h-5" />
                  </div>

                  {/* Amount Input */}
                  <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
                    <div className="flex flex-col gap-1 px-4 py-2">
                      <label className="text-text-secondary text-sm font-medium">Amount</label>
                      <input
                        placeholder="Enter amount"
                        value={amount || ""}
                        className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                        autoComplete="off"
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Connect Wallet Button */}
                  <div className="flex justify-center">
                    {user && handleSubmitPayment ? (
                      <PrimaryButton text="Pay now" onClick={handleSubmitPayment} loading={isSending} />
                    ) : (
                      <PrimaryButton
                        text="Connect Wallet"
                        onClick={() => handleConnectWallet?.()}
                        loading={isLoading}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="flex flex-col justify-between items-center w-[50%]">
            <div className="flex flex-col gap-2 w-full">
              <span className="text-text-primary text-2xl font-semibold">Transfer Details</span>

              <div
                className="w-full bg-background rounded-[12px] flex flex-row gap-1 border border-primary-divider p-3 py-5 justify-between items-center"
                style={{
                  backgroundImage: `url(/card/background.svg)`,
                  backgroundSize: "20%",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex flex-col gap-2 flex-1 min-w-0 max-w-full">
                  <span className="text-text-secondary text-base font-bold leading-none truncate">
                    {title || "Enter title"}
                  </span>
                  <span className="text-text-secondary text-sm leading-none truncate">
                    {description || "Description"}
                  </span>
                </div>

                <div className="flex flex-row gap-1 items-center">
                  {selectedToken && (
                    <img
                      src={
                        QASH_TOKEN_ADDRESS.includes(selectedToken?.faucetId || "")
                          ? "/token/qash.svg"
                          : blo(turnBechToHex(selectedToken?.faucetId || ""))
                      }
                      className="w-5 h-5"
                    />
                  )}
                  <span className="text-text-primary font-semibold leading-none">
                    {amount || "0"} {selectedToken?.metadata.symbol || ""}
                  </span>
                </div>
              </div>

              {/* TODO: Add network fee */}
              {/* <div
                className="w-full bg-background rounded-[12px] flex flex-row gap-1 border border-primary-divider p-3 py-5 justify-between items-center"
                style={{
                  backgroundImage: `url(/card/background.svg)`,
                  backgroundSize: "20%",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <img src="/misc/globe.svg" alt="Global" className="w-5 h-5" />
                  <span className="text-text-secondary leading-none">Network Fee</span>
                </div>

                <div className="flex flex-row gap-1 items-center">
                  {selectedToken && (
                    <img
                      src={
                        `${QASH_TOKEN_ADDRESS}` === selectedToken?.faucetId
                          ? "/token/qash.svg"
                          : blo(turnBechToHex(selectedToken?.faucetId || ""))
                      }
                      className="w-5 h-5"
                    />
                  )}
                  <span className="text-text-primary font-semibold leading-none">
                    0 {selectedToken?.metadata.symbol || ""}
                  </span>
                </div>
              </div> */}

              <div
                className="w-full bg-background rounded-[12px] flex flex-row gap-1 border border-primary-divider p-3 py-5 justify-between items-center"
                style={{
                  backgroundImage: `url(/card/background.svg)`,
                  backgroundSize: "20%",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-text-secondary text-sm leading-none">Total payable amount</span>
                  <div className="flex flex-row gap-1 items-center">
                    {selectedToken && (
                      <img
                        src={
                          QASH_TOKEN_ADDRESS.includes(selectedToken?.faucetId || "")
                            ? "/token/qash.svg"
                            : blo(turnBechToHex(selectedToken?.faucetId || ""))
                        }
                        className="w-5 h-5"
                      />
                    )}
                    <span className="text-text-primary text-2xl leading-none">
                      {(parseFloat(amount || "0") + 0).toFixed(2)} {selectedToken?.metadata.symbol || ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex flex-col gap-2 w-full items-center justify-center border-t border-primary-divider pt-2 mt-2">
              <span className="text-text-primary text-sm leading-none">Have you already paid?</span>
              <span className="text-text-primary text-sm leading-none">
                <span className="text-primary-blue text-sm leading-none">Click here</span> to submit your transaction
                hash.
              </span>
            </div> */}
          </div>
        </div>
      </BaseContainer>
    </>
  );
};
