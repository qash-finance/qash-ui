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
import { MODAL_IDS, TransactionOverviewModalProps } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { createP2IDENote } from "@/services/utils/miden/note";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { sendSingleTransaction } from "@/services/api/transaction";
import { useAccount } from "@/hooks/web3/useAccount";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { PaymentLinkPreview } from "@/components/PaymentLink/PaymentLinkPreview";

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
  const { walletAddress } = useWalletConnect();

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

      <div className="flex items-center justify-center gap-3">
        {walletAddress && (
          <div
            className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-2 py-1.5 border-t-2 border-primary-divider"
            onClick={() => router.push("/")}
          >
            <img src="/chain/miden.svg" alt="Qash Logo" />
            <span className="text-text-primary text-lg">{formatAddress(walletAddress)}</span>
          </div>
        )}

        <div
          className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-2 py-1.5 border-t-2 border-primary-divider"
          onClick={() => router.push("/")}
        >
          <img src="/sidebar/filled-home.svg" alt="Qash Logo" />
          <span className="text-text-primary text-lg font-semibold">Go to Home</span>
        </div>
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
  const { openModal, closeModal } = useModal();
  const { accountBalance } = useAccount();
  const { assets, accountId: walletAddressFromContext, forceFetch: forceRefetchAssets } = useAccountContext();
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

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

    const recallableTime = 3600 * 24; // Default to 24 hours
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

          openModal<TransactionOverviewModalProps>(MODAL_IDS.TRANSACTION_OVERVIEW, {
            amount: amount.toString(),
            accountName: "My Account",
            accountAddress: walletAddress,
            recipientName: paymentLink?.title,
            recipientAddress,
            transactionType: isPrivateTransaction ? "Private" : "Public",
            cancellableTime: `${recallableTime / 3600} hour(s)`,
            message: `Payment for ${paymentLink?.title}`,
            tokenAddress: paymentLink?.acceptedTokens?.[0]?.faucetId,
            tokenSymbol: paymentLink?.acceptedTokens?.[0]?.symbol,
            transactionHash: txId,
            onConfirm: async () => {
              router.push(`/`);
            },
          });
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
          <PaymentLinkPreview
            amount={paymentLink.amount}
            title={paymentLink.title}
            description={paymentLink.description}
            selectedToken={
              paymentLink.acceptedTokens?.[0]
                ? {
                    faucetId: paymentLink.acceptedTokens?.[0]?.faucetId || "",
                    metadata: {
                      symbol: paymentLink.acceptedTokens?.[0]?.symbol || "",
                      decimals: paymentLink.acceptedTokens?.[0]?.decimals || 8,
                      maxSupply: 0,
                    },
                    amount: "0",
                  }
                : null
            }
            handleConnectWallet={() => openModal(MODAL_IDS.SELECT_WALLET)}
            handleSubmitPayment={handleSubmitPayment}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkDetailPage;
