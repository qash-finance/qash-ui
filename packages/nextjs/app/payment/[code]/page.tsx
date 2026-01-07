"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useGetPaymentLinkByCode, useRecordPayment } from "@/services/api/payment-link";
import { BaseContainer } from "@/components/Common/BaseContainer";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { QASH_TOKEN_ADDRESS, BLOCK_TIME, REFETCH_DELAY, QASH_TOKEN_DECIMALS } from "@/services/utils/constant";
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
import { importAndGetAccount } from "@/services/utils/miden/account";
import { sendSingleTransaction } from "@/services/api/transaction";
import { useAccount } from "@/hooks/web3/useAccount";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { PaymentLinkPreview } from "@/components/PaymentLink/PaymentLinkPreview";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { useAuth } from "@/services/auth/context";
import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { useParaMiden } from "miden-para-react";

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
  const { user } = useAuth();
  const { openModal } = useModal();
  const { address: walletAddress } = useMidenProvider();

  const router = useRouter();

  // Simplified behavior: show setup when there is no user, otherwise show home
  const hasCompany = !!user?.teamMembership?.companyId || !!user?.teamMembership?.company;

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
            className="flex items-center justify-center gap-2 bg-background rounded-lg p-2 py-1.5 border-t-2 border-primary-divider cursor-pointer"
            onClick={() => openModal("PORTFOLIO")}
          >
            <img src="/chain/miden.svg" alt="Qash Logo" />
            <span className="text-text-primary text-lg">{formatAddress(walletAddress)}</span>
          </div>
        )}

        {/* Only show setup/home button after wallet is connected */}
        {walletAddress &&
          (hasCompany ? (
            <div
              className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-2 py-1.5 border-t-2 border-primary-divider"
              onClick={() => router.push("/")}
            >
              <img src="/sidebar/filled-home.svg" alt="Qash Logo" />
              <span className="text-text-primary text-lg font-semibold">Go to Home</span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-2 py-1.5 border-t-2 border-primary-divider"
              onClick={() => router.push("/onboarding")}
            >
              <img src="/sidebar/filled-home.svg" alt="Setup" />
              <span className="text-text-primary text-lg font-semibold">Set up your account</span>
            </div>
          ))}
      </div>
    </div>
  );
};

const PaymentLinkDetailPage = () => {
  const params = useParams();
  const code = params.code as string;
  const { loginWithPara, isAuthenticated, user, refreshUser } = useAuth();
  const { address: walletAddress, openModal: openParaModal, client: midenClient } = useMidenProvider();
  const { data: paymentLink, isLoading, error } = useGetPaymentLinkByCode(code);
  const [isQRCodeCollapsed, setIsQRCodeCollapsed] = useState(true);
  const [isWalletAddressCollapsed, setIsWalletAddressCollapsed] = useState(false);
  const recordPaymentMutation = useRecordPayment();
  const { openModal, closeModal } = useModal();
  const [isSending, setIsSending] = useState(false);
  const [authenticatingWithPara, setAuthenticatingWithPara] = useState(false);
  const router = useRouter();
  const isAuthenticatingRef = useRef(false);
  const { isConnected } = useParaAccount();
  const { para } = useParaMiden("https://rpc.testnet.miden.io");

  // Handle Para authentication after connection
  const handleParaAuthentication = async () => {
    // Prevent duplicate authentication attempts
    if (isAuthenticatingRef.current) {
      return;
    }

    if (!isConnected || !para) {
      toast.error("Please connect your wallet first");
      return;
    }

    isAuthenticatingRef.current = true;
    setAuthenticatingWithPara(true);
    try {
      // Issue JWT from Para
      const jwtResult = await para.issueJwt();

      if (!jwtResult?.token) {
        throw new Error("Failed to get JWT token from Para");
      }

      await loginWithPara(jwtResult.token);

      toast.success("Successfully authenticated");

      await refreshUser();
    } catch (error) {
      console.error("Para authentication failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to authenticate with Para");
    } finally {
      isAuthenticatingRef.current = false;
      setAuthenticatingWithPara(false);
    }
  };

  // Auto-authenticate when Para connection is established
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authenticatingWithPara && !isAuthenticatingRef.current) {
      handleParaAuthentication();
    }
  }, [isConnected, isAuthenticated, authenticatingWithPara]);

  const handleSubmitPayment = async () => {
    const midenSdk = await import("@demox-labs/miden-sdk");
    const {
      Note,
      WebClient,
      Address,
      NoteAssets,
      FungibleAsset,
      NoteType,
      Felt,
      TransactionRequestBuilder,
      BasicFungibleFaucetComponent,
      OutputNote,
    } = midenSdk;
    const OutputNoteArray = (midenSdk as any).OutputNoteArray;

    if (!walletAddress) {
      return toast.error("Please connect your wallet");
    }

    try {
      setIsSending(true);

      openModal("PROCESSING_TRANSACTION");
      // prepare an array of p2id note
      const p2idNotes: any[] = [];
      const p2idNotesCopy: any[] = [];
      const recipientAddresses = [];
      const assets_arr = [];
      let totalAmount = 0;

      // Handle single payment link
      const paymentTokenAddress = paymentLink?.acceptedTokens?.[0]?.address;
      const paymentAmount = parseFloat(paymentLink?.amount || "0");
      const recipientAddress = paymentLink?.paymentWalletAddress;

      if (!paymentTokenAddress || !recipientAddress) {
        toast.error("Invalid payment details");
        closeModal("PROCESSING_TRANSACTION");
        return;
      }

      const faucetAccount = await importAndGetAccount(midenClient, paymentTokenAddress);
      // get faucet metadata
      const faucetMetadata = await BasicFungibleFaucetComponent.fromAccount(faucetAccount);
      assets_arr.push(faucetMetadata);
      totalAmount += paymentAmount;

      // build p2id note
      const p2idNote = Note.createP2IDNote(
        Address.fromBech32(walletAddress).accountId(),
        Address.fromBech32(recipientAddress).accountId(),
        new NoteAssets([
          new FungibleAsset(
            Address.fromBech32(paymentTokenAddress).accountId(),
            BigInt(paymentAmount * 10 ** faucetMetadata.decimals() || 8),
          ),
        ]),
        NoteType.Private,
        new Felt(BigInt(0)),
      );
      const p2idNoteCopy = p2idNote;
      // Convert Note to OutputNote
      p2idNotes.push(OutputNote.full(p2idNote));
      p2idNotesCopy.push(p2idNoteCopy);
      recipientAddresses.push(recipientAddress);

      // Build transaction request with OutputNoteArray
      const outputNotesArray = new OutputNoteArray(p2idNotes);
      const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(outputNotesArray).build();
      const midenParaClient = midenClient as import("@demox-labs/miden-sdk").WebClient;
      const executedTx = await midenParaClient.executeTransaction(
        Address.fromBech32(walletAddress).accountId(),
        transactionRequest,
      );
      console.log("Start proving transaction");
      const provenTx = await midenParaClient.proveTransaction(executedTx);
      console.log("Start submitting proven transaction");
      const submissionHeight = await midenParaClient.submitProvenTransaction(provenTx, executedTx);
      console.log("Start applying transaction");
      await midenParaClient.applyTransaction(executedTx, submissionHeight);
      console.log("Start sending private notes");
      // loop through p2idNotes and recipientAddresses, send each private note
      for (let i = 0; i < p2idNotes.length; i++) {
        await midenParaClient.sendPrivateNote(p2idNotesCopy[i], Address.fromBech32(recipientAddresses[i]));
      }
      console.log("Start recording payment");
      recordPaymentMutation.mutate({
        code,
        data: {
          payer: walletAddress,
          txid: executedTx.executedTransaction().id().toHex(),
          token: paymentLink?.acceptedTokens?.[0],
        },
      });
      closeModal("PROCESSING_TRANSACTION");
      openModal<TransactionOverviewModalProps>("TRANSACTION_OVERVIEW", {
        amount: totalAmount.toString(),
        tokenSymbol: paymentLink?.acceptedTokens?.[0]?.symbol || "USDT",
        tokenAddress: paymentTokenAddress,
        accountAddress: walletAddress,
        accountName: "You",
        recipientAddress: recipientAddresses.join(","),
        recipientName: paymentLink?.title || "Receiver",
        transactionType: "Send",
        transactionHash: executedTx.executedTransaction().id().toHex(),
        onConfirm: () => {
          closeModal("TRANSACTION_OVERVIEW");
          router.push("/");
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to process the transaction");
    } finally {
      setIsSending(false);
      closeModal("PROCESSING_TRANSACTION");
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
            recipient={paymentLink.company.companyName}
            paymentWalletAddress={paymentLink.paymentWalletAddress}
            amount={paymentLink.amount}
            title={paymentLink.title}
            description={paymentLink.description}
            selectedToken={
              paymentLink.acceptedTokens?.[0]
                ? {
                    faucetId: paymentLink.acceptedTokens?.[0]?.address || "",
                    metadata: {
                      symbol: paymentLink.acceptedTokens?.[0]?.symbol || "",
                      decimals: paymentLink.acceptedTokens?.[0]?.decimals || 8,
                      maxSupply: 0,
                    },
                    amount: "0",
                  }
                : null
            }
            handleConnectWallet={() => openParaModal?.()}
            handleSubmitPayment={handleSubmitPayment}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkDetailPage;
