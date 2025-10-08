"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useGetPaymentLinkByCode, useRecordPayment } from "@/services/api/payment-link";
import { BaseContainer } from "@/components/Common/BaseContainer";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { QASH_TOKEN_ADDRESS, BLOCK_TIME, REFETCH_DELAY } from "@/services/utils/constant";
import { Badge, BadgeStatus } from "@/components/Common/Badge";
import { PaymentLinkStatus } from "@/types/payment-link";
import { useWalletState } from "@/services/store";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { createP2IDENote } from "@/services/utils/miden/note";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { sendSingleTransaction } from "@/services/api/transaction";
import { useAccount } from "@/hooks/web3/useAccount";

const SubIcon = ({
  icon,
  onClick,
  tooltipId,
  tooltipContent,
}: {
  icon: string;
  onClick: () => void;
  tooltipId?: string;
  tooltipContent?: string;
}) => {
  return (
    <div
      className="flex justify-center items-center w-[28px] h-[28px] rounded-lg bg-app-background border-t-2 border-primary-divider cursor-pointer"
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

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full flex justify-between items-center p-2 pt-1">
      <div className="flex items-center justify-center">
        <img src="/logo/qash-icon.svg" alt="Qash Logo" />
        <img
          src="/logo/ash-text-icon.svg"
          alt="Qash Logo"
          className="w-12"
          style={{ transition: "width 200ms ease" }}
        />
      </div>

      <div
        className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-2 py-1.5"
        onClick={() => router.push("/")}
      >
        <img src="/sidebar/filled-home.svg" alt="Qash Logo" />
        <span className="text-text-primary text-lg font-semibold">Go to Home</span>
      </div>
    </div>
  );
};

const PaymentLinkDetailPage = () => {
  const params = useParams();
  const code = params.code as string;
  const { walletAddress } = useWalletState();
  const { data: paymentLink, isLoading, error } = useGetPaymentLinkByCode(code);
  const [isQRCodeCollapsed, setIsQRCodeCollapsed] = useState(true);
  const [isWalletAddressCollapsed, setIsWalletAddressCollapsed] = useState(false);
  const recordPaymentMutation = useRecordPayment();
  const [txid, setTxid] = useState("");
  const { openModal, closeModal } = useModal();
  const { accountBalance } = useAccount();
  const { assets, accountId: walletAddressFromContext, forceFetch: forceRefetchAssets } = useAccountContext();
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const [isSending, setIsSending] = useState(false);

  const handleSubmitPayment = async () => {
    if (Number(accountBalance) < parseFloat(paymentLink?.amount || "0")) {
      toast.error("Insufficient balance");
      return;
    }

    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!paymentLink?.acceptedTokens?.[0]) {
      toast.error("No accepted token found for this payment link");
      return;
    }

    // Open processing modal first
    openModal(MODAL_IDS.PROCESSING_TRANSACTION, {});

    setIsSending(true);

    const recallableTime = 3600; // Default to 1 hour
    // each block is 5 seconds, calculate recall height
    const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

    // Find the selected token from assets based on tokenAddress
    const selectedToken = assets.find(asset => asset.faucetId === paymentLink.acceptedTokens?.[0]?.faucetId) || {
      amount: "0",
      faucetId: paymentLink.acceptedTokens[0].faucetId,
      metadata: {
        symbol: paymentLink.acceptedTokens[0].symbol,
        decimals: paymentLink.acceptedTokens[0].decimals,
        maxSupply: 0,
      },
    };

    // Create AccountId objects once to avoid aliasing issues
    const senderAccountId = walletAddress;
    const recipientAccountId = paymentLink.payee;
    const faucetAccountId = selectedToken.faucetId;

    await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, {
      amount: parseFloat(paymentLink.amount || "0"),
      recipientAddress: paymentLink.payee,
      recallableTime,
      isPrivateTransaction: false,
      message: paymentLink.description,
    });
  };

  const handleSingleSendTransaction = async (
    senderAccountId: string,
    recipientAccountId: string,
    faucetAccountId: string,
    recallHeight: number,
    data: {
      amount: number;
      recipientAddress: string;
      recallableTime: number;
      isPrivateTransaction: boolean;
      message?: string;
    },
  ) => {
    const { amount, recipientAddress, recallableTime, isPrivateTransaction } = data;

    try {
      // create note
      const [note, serialNumbers, noteRecallHeight] = await createP2IDENote(
        senderAccountId,
        recipientAccountId,
        faucetAccountId,
        Math.round(amount * Math.pow(10, paymentLink?.acceptedTokens?.[0]?.decimals || 8)),
        isPrivateTransaction ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
        recallHeight,
      );

      const noteId = note.id().toString();

      // submit transaction to miden
      const txId = await submitTransactionWithOwnOutputNotes(senderAccountId, [note]);
      console.log("isPrivateTransaction", isPrivateTransaction);
      // submit transaction to server
      const response = await sendSingleTransaction({
        assets: [
          {
            faucetId: paymentLink?.acceptedTokens?.[0]?.faucetId || "",
            amount: amount.toString(),
            metadata: {
              symbol: paymentLink?.acceptedTokens?.[0]?.symbol || "",
              decimals: paymentLink?.acceptedTokens?.[0]?.decimals || 8,
              maxSupply: 0,
            },
          },
        ],
        private: isPrivateTransaction,
        recipient: recipientAddress,
        recallable: true,
        recallableTime: new Date(Date.now() + recallableTime * 1000),
        recallableHeight: noteRecallHeight,
        serialNumber: serialNumbers,
        noteType: CustomNoteType.P2IDR,
        noteId: noteId,
        transactionId: txId,
      });

      setTimeout(() => {
        forceRefetchAssets();
        forceRefetchRecallablePayment();
      }, REFETCH_DELAY);

      if (response) {
        // Record the payment in the payment link system
        try {
          await recordPaymentMutation.mutateAsync({
            code,
            data: {
              payer: walletAddress,
              txid: txId,
              token: paymentLink?.acceptedTokens?.[0],
            },
          });

          // Close processing modal
          closeModal(MODAL_IDS.PROCESSING_TRANSACTION);
          toast.success("Payment completed!");
        } catch (recordError: any) {
          console.error("Failed to record payment:", recordError);
          toast.error("Payment completed but failed to record in payment link system");
        }
      }
    } catch (error) {
      // Close processing modal on error
      closeModal(MODAL_IDS.PROCESSING_TRANSACTION);
      console.error("Failed to send transaction:", error);
      toast.error("Failed to send transaction :(");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <img src="/loading-square.gif" alt="loading" className="w-12 h-12" />
      </div>
    );
  }

  if (error || !paymentLink || paymentLink.status === PaymentLinkStatus.DEACTIVATED) {
    return (
      <div className="flex flex-col w-full h-full bg-app-background p-2 gap-2">
        <Header />

        <div
          className="w-full h-full relative flex justify-center items-center flex-col rounded-lg"
          style={{
            background: "linear-gradient(180deg, #D7D7D7 0%, #FFF 60.33%)",
          }}
        >
          <div className="w-fit h-fit relative flex justify-center items-center flex-col gap-4 z-2">
            <span className="text-text-primary text-7xl font-bold anton-regular leading-none uppercase">
              Oops, this link isn’t active anymore.
            </span>
            <span className="text-text-primary text-lg">
              Looks like the creator has turned it off. You can reach out to them to get a new one.
            </span>
          </div>
        </div>

        <img
          src="/gift/background-qash-text.svg"
          alt="background-qash-text"
          className="w-[1050px] absolute top-100 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-app-background p-2">
      <Header />

      <div className="flex flex-col w-full h-screen p-4 items-center justify-start gap-10 bg-background rounded-lg">
        {/* Header */}
        <div className="w-full flex flex-row gap-2 px-7 items-center justify-start">
          <img src="/misc/star-icon.svg" alt="Payment Link" />
          <h1 className="text-2xl font-bold">Payment Link</h1>
        </div>

        <div className="flex flex-col gap-5 py-5 w-[80%]">
          <BaseContainer
            header={
              <header className="flex items-center w-full justify-between px-5">
                <div className="flex flex-1 gap-2 items-center">
                  <img
                    src={blo(turnBechToHex(walletAddress || ""))}
                    alt="Recipient avatar"
                    className="w-[24px] rounded-full"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm truncate text-text-primary leading-none">Q3x</span>
                      <img src="/logo/miden.svg" className="w-4" alt="miden logo icon" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm truncate text-text-secondary leading-none">
                        {formatAddress(walletAddress?.toString() || "0x")}
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
                    className="flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    // INFO: Uncomment this to enable the collapsible section
                    // onClick={() => {
                    //   setIsQRCodeCollapsed(!isQRCodeCollapsed);
                    //   setIsWalletAddressCollapsed(true);
                    // }}
                  >
                    <div className="flex items-center gap-3">
                      <SubIcon icon="/misc/qr-icon.svg" onClick={() => {}} />
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
                            <span className="text-text-primary">Ethereum Mainnet</span>
                          </div>
                        </div>
                      </div>

                      {/* Token Selection */}
                      <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          {paymentLink.acceptedTokens?.[0]?.symbol ? (
                            <>
                              <img
                                alt=""
                                className="w-5 h-5"
                                src={
                                  paymentLink.acceptedTokens?.[0]?.symbol === "QASH"
                                    ? "/token/qash.svg"
                                    : "/token/eth.svg"
                                }
                              />
                              <span className="text-text-primary">{paymentLink.acceptedTokens?.[0]?.symbol}</span>
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
                            value={paymentLink.amount || ""}
                            className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                            autoComplete="off"
                            disabled={true}
                          />
                        </div>
                      </div>

                      {/* Connect Wallet Button */}
                      <div className="flex justify-center">
                        {walletAddress ? (
                          <PrimaryButton text="Pay now" onClick={handleSubmitPayment} loading={isSending} />
                        ) : (
                          <PrimaryButton text="Connect Wallet" onClick={() => openModal(MODAL_IDS.SELECT_WALLET)} />
                        )}
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
                            <span className="text-text-primary">Ethereum Mainnet</span>
                          </div>
                        </div>
                      </div>

                      {/* Token Selection */}
                      <div className="bg-app-background border-b border-primary-divider rounded-lg flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          {paymentLink.acceptedTokens?.[0]?.symbol ? (
                            <>
                              <img
                                alt=""
                                className="w-5 h-5"
                                src={
                                  paymentLink.acceptedTokens?.[0]?.symbol === "QASH"
                                    ? "/token/qash.svg"
                                    : "/token/eth.svg"
                                }
                              />
                              <span className="text-text-primary">{paymentLink.acceptedTokens?.[0]?.symbol}</span>
                            </>
                          ) : (
                            <span className="text-text-primary">Select token</span>
                          )}
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div className="bg-app-background rounded-xl border-b-2 border-primary-divider">
                        <div className="flex flex-col gap-1 px-4 py-2">
                          <label className="text-text-secondary text-sm font-medium">Amount</label>
                          <input
                            placeholder="Enter amount"
                            value={paymentLink.amount || ""}
                            className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                            autoComplete="off"
                            disabled={true}
                          />
                        </div>
                      </div>

                      {/* Connect Wallet Button */}
                      <div className="flex justify-center">
                        {walletAddress ? (
                          <PrimaryButton
                            text="Pay now"
                            onClick={handleSubmitPayment}
                            loading={isSending}
                            disabled={isSending}
                          />
                        ) : (
                          <PrimaryButton text="Connect Wallet" onClick={() => openModal(MODAL_IDS.SELECT_WALLET)} />
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
                        {paymentLink.title || "Enter title"}
                      </span>
                      <span className="text-text-secondary text-sm leading-none truncate">
                        {paymentLink.description || "Description"}
                      </span>
                    </div>

                    <div className="flex flex-row gap-1 items-center">
                      {paymentLink.acceptedTokens?.[0] && (
                        <img
                          src={
                            `${QASH_TOKEN_ADDRESS}` === paymentLink.acceptedTokens?.[0]?.faucetId
                              ? "/token/qash.svg"
                              : blo(turnBechToHex(paymentLink.acceptedTokens?.[0]?.faucetId || ""))
                          }
                          className="w-5 h-5"
                        />
                      )}
                      <span className="text-text-primary font-semibold leading-none">
                        {paymentLink.amount || "0"} {paymentLink.acceptedTokens?.[0]?.symbol || ""}
                      </span>
                    </div>
                  </div>

                  <div
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
                      {paymentLink.acceptedTokens?.[0] && (
                        <img
                          src={
                            `${QASH_TOKEN_ADDRESS}` === paymentLink.acceptedTokens?.[0]?.faucetId
                              ? "/token/qash.svg"
                              : blo(turnBechToHex(paymentLink.acceptedTokens?.[0]?.faucetId || ""))
                          }
                          className="w-5 h-5"
                        />
                      )}
                      <span className="text-text-primary font-semibold leading-none">
                        0 {paymentLink.acceptedTokens?.[0]?.symbol || ""}
                      </span>
                    </div>
                  </div>

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
                        {paymentLink.acceptedTokens?.[0] && (
                          <img
                            src={
                              `${QASH_TOKEN_ADDRESS}` === paymentLink.acceptedTokens?.[0]?.faucetId
                                ? "/token/qash.svg"
                                : blo(turnBechToHex(paymentLink.acceptedTokens?.[0]?.faucetId || ""))
                            }
                            className="w-5 h-5"
                          />
                        )}
                        <span className="text-text-primary text-2xl leading-none">
                          {(parseFloat(paymentLink.amount || "0") + 0).toFixed(2)}{" "}
                          {paymentLink.acceptedTokens?.[0]?.symbol || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full items-center justify-center border-t border-primary-divider pt-2 mt-2">
                  <span className="text-text-primary text-sm leading-none">Have you already paid?</span>
                  <span className="text-text-primary text-sm leading-none">
                    <span className="text-primary-blue text-sm leading-none">Click here</span> to submit your
                    transaction hash.
                  </span>
                </div>
              </div>
            </div>
          </BaseContainer>
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkDetailPage;
