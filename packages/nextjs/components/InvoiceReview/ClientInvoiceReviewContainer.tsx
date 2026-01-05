"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useInvoice } from "@/hooks/server/useInvoice";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/services/auth/context";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalManagerProvider";
import { ConfirmAndReviewInvoiceModalProps, MODAL_IDS } from "@/types/modal";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { importAndGetAccount } from "@/services/utils/miden/account";
import { TransactionOverviewModalProps } from "@/types/modal";
import { confirmB2BInvoice, getB2BInvoiceByUUID, getB2BInvoiceByUUIDPublic } from "@/services/api/invoice";
import { formatAddress } from "@/services/utils/miden/address";
import { useParaMiden } from "miden-para-react";

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  amount: number;
  currency: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: {
    name: string;
    email: string;
    company: string;
    address: string;
    network: string;
    token: string;
    walletAddress: string;
  };
  billTo: {
    name: string;
    email: string;
    company: string;
    address: string;
  };
  note?: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  amountDue: number;
  currency: string;
  status: string;
}

const Header = () => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { address: walletAddress } = useMidenProvider();
  const router = useRouter();

  const hasUser = !!user;

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

        {hasUser ? (
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
        )}
      </div>
    </div>
  );
};

export const ClientInvoiceReviewContainer = () => {
  const { openModal, closeModal } = useModal();
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("uuid") || "";
  const { address: walletAddress, openModal: openParaModal, client } = useMidenProvider();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<{ icon: string; name: string; value: string } | null>(null);
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);

  const { isLoading, error, fetchInvoiceByUUID, confirmInvoiceData, downloadPdf } = useInvoice();

  const mapNetworkToOption = (network: any) => {
    const name = network?.name || "Miden Testnet";
    const lname = name.toLowerCase();
    let icon = "/chain/miden.svg";
    let value = "miden";

    if (lname.includes("ethereum")) {
      icon = "/chain/ethereum.svg";
      value = "eth";
    } else if (lname.includes("miden")) {
      icon = "/chain/miden.svg";
      value = "miden";
    } else if (lname.includes("sol")) {
      icon = "/chain/solana.svg";
      value = "sol";
    } else if (lname.includes("bnb") || lname.includes("bsc")) {
      icon = "/chain/bnb.svg";
      value = "bnb";
    } else if (lname.includes("base")) {
      icon = "/chain/base.svg";
      value = "base";
    }

    return { icon, name, value };
  };

  const makeAssetFromPaymentToken = (token: any): AssetWithMetadata => {
    if (!token) {
      return {
        amount: "0",
        faucetId: QASH_TOKEN_ADDRESS,
        metadata: {
          symbol: QASH_TOKEN_SYMBOL,
          decimals: QASH_TOKEN_DECIMALS,
          maxSupply: QASH_TOKEN_MAX_SUPPLY,
        },
      };
    }

    const faucetId = token.address || token.faucetId || QASH_TOKEN_ADDRESS;
    const symbol = token.symbol || token.name || QASH_TOKEN_SYMBOL;
    const decimals =
      typeof token.decimals === "number" ? token.decimals : parseInt(token.decimals || String(QASH_TOKEN_DECIMALS), 10);

    return {
      amount: "0",
      faucetId,
      metadata: {
        symbol,
        decimals,
        maxSupply: QASH_TOKEN_MAX_SUPPLY,
      },
    };
  };

  // Load invoice data on mount
  useEffect(() => {
    if (!invoiceUUID) return;
    loadInvoice();
  }, [invoiceUUID]);

  const loadInvoice = async () => {
    try {
      const data = await getB2BInvoiceByUUIDPublic(invoiceUUID);
      const mappedData = mapApiResponseToInvoiceData(data);
      setInvoiceData(mappedData);

      // Auto-select network and token when available from API
      if (data?.paymentNetwork) {
        setSelectedNetwork(mapNetworkToOption(data.paymentNetwork));
      }

      if (data?.paymentToken) {
        setSelectedToken(makeAssetFromPaymentToken(data.paymentToken));
      } else if (mappedData?.from?.token) {
        // fallback when only symbol is present
        setSelectedToken(makeAssetFromPaymentToken({ symbol: mappedData.from.token }));
      }
    } catch (err) {
      console.error("Failed to load invoice:", err);
    }
  };

  const mapApiResponseToInvoiceData = (apiData: any): InvoiceData => {
    // Map API response to InvoiceData interface
    const invoiceNumber = apiData.invoiceNumber;

    const fromDetails = apiData.fromDetails || {};
    const fromCompany = apiData.fromCompany || {};
    const toDetails = apiData.toDetails || {};
    const paymentNetwork = apiData.paymentNetwork || {};
    const paymentToken = apiData.paymentToken || {};

    // Build address from fromDetails with fallback to fromCompany
    const fromAddress =
      [fromDetails.address1, fromDetails.address2, fromDetails.city, fromDetails.state, fromDetails.postalCode]
        .filter(Boolean)
        .join(", ") ||
      [fromCompany.address1, fromCompany.address2, fromCompany.city, fromCompany.postalCode].filter(Boolean).join(", ");

    // Build recipient address
    const toAddress = [toDetails.address, toDetails.city, toDetails.country, toDetails.postalCode]
      .filter(Boolean)
      .join(", ");

    return {
      invoiceNumber: invoiceNumber,
      date: apiData.issueDate ? new Date(apiData.issueDate).toLocaleDateString() : "",
      dueDate: apiData.dueDate ? new Date(apiData.dueDate).toLocaleDateString() : "",
      from: {
        name: fromDetails.contactName || fromCompany.companyName || "",
        email: fromDetails.email || apiData.emailTo || "",
        company: fromDetails.companyName || fromCompany.companyName || "",
        address: fromAddress,
        network: paymentNetwork.name || "Ethereum",
        token: paymentToken.symbol || "USD",
        walletAddress: apiData.paymentWalletAddress || "",
      },
      billTo: {
        name: toDetails.contactName || apiData.toCompanyName || "",
        email: toDetails.email || apiData.toCompanyEmail || apiData.emailTo || "",
        company: toDetails.companyName || apiData.toCompanyName || "",
        address: toAddress,
      },
      items: (apiData.items || []).map((item: any) => ({
        description: item.description || "",
        qty: parseFloat(item.quantity || "1"),
        price: parseFloat(item.unitPrice || "0"),
        amount: parseFloat(item.total || "0"),
        currency: apiData.currency || "USD",
      })),
      subtotal: parseFloat(apiData.subtotal || "0"),
      total: parseFloat(apiData.total || "0"),
      amountDue: parseFloat(apiData.total || "0"),
      currency: apiData.currency || "USD",
      status: apiData.status,
    };
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadPdf(invoiceUUID);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceData?.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  const handleConfirmInvoice = async () => {
    if (invoiceData && !invoiceData.from.address) {
      toast.error("Please update the address before confirming the invoice");
      return;
    }

    try {
      openModal<ConfirmAndReviewInvoiceModalProps>("CONFIRM_AND_REVIEW_INVOICE", {
        onConfirm: async () => {
          await confirmInvoiceData(invoiceUUID);
          closeModal("CONFIRM_AND_REVIEW_INVOICE");
          toast.success("Invoice confirmed successfully");
          loadInvoice();
        },
      });
    } catch (err) {
      console.error("Failed to confirm invoice:", err);
    }
  };

  const handlePayNow = async () => {
    if (!walletAddress) {
      return toast.error("Please connect your wallet");
    }

    if (!invoiceData) return;

    if (!selectedToken) {
      return toast.error("Please select a payment token");
    }

    setProcessingPayment(true);

    try {
      openModal("PROCESSING_TRANSACTION");

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

      const p2idNotes: any[] = [];
      const recipientAddresses: string[] = [];

      const paymentTokenAddress = selectedToken.faucetId;
      const paymentAmount = invoiceData.total;
      const recipientAddress = invoiceData.from.walletAddress;

      // get faucet account and metadata
      const faucetAccount = await importAndGetAccount(client, paymentTokenAddress);
      const faucetMetadata = await BasicFungibleFaucetComponent.fromAccount(faucetAccount);

      const p2idNote = Note.createP2IDNote(
        Address.fromBech32(walletAddress).accountId(),
        Address.fromBech32(recipientAddress).accountId(),
        new NoteAssets([
          new FungibleAsset(
            Address.fromBech32(paymentTokenAddress).accountId(),
            BigInt((paymentAmount || 0) * 10 ** faucetMetadata.decimals() || 8),
          ),
        ]),
        NoteType.Private,
        new Felt(BigInt(0)),
      );

      p2idNotes.push(OutputNote.full(p2idNote));
      recipientAddresses.push(recipientAddress);

      const outputNotesArray = new OutputNoteArray(p2idNotes);
      const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(outputNotesArray).build();

      const midenParaClient = client as import("@demox-labs/miden-sdk").WebClient;
      const executedTx = await midenParaClient.executeTransaction(
        Address.fromBech32(walletAddress).accountId(),
        transactionRequest,
      );

      const provenTx = await midenParaClient.proveTransaction(executedTx);
      const submissionHeight = await midenParaClient.submitProvenTransaction(provenTx, executedTx);
      await midenParaClient.applyTransaction(executedTx, submissionHeight);

      for (let i = 0; i < p2idNotes.length; i++) {
        await midenParaClient.sendPrivateNote(p2idNotes[i], Address.fromBech32(recipientAddresses[i]));
      }

      await confirmB2BInvoice(invoiceUUID);

      closeModal("PROCESSING_TRANSACTION");

      openModal<TransactionOverviewModalProps>("TRANSACTION_OVERVIEW", {
        amount: String(paymentAmount),
        tokenSymbol: selectedToken.metadata.symbol || invoiceData.currency,
        tokenAddress: paymentTokenAddress,
        accountAddress: walletAddress,
        accountName: "You",
        recipientAddress: recipientAddresses.join(","),
        recipientName: invoiceData.from.company || invoiceData.from.name || "Receiver",
        transactionType: "Send",
        transactionHash: executedTx.executedTransaction().id().toHex(),
        onConfirm: () => {
          closeModal("TRANSACTION_OVERVIEW");
          // Refresh invoice after payment
          loadInvoice();
        },
      });

      toast.success("Payment completed");
    } catch (error: any) {
      console.error(error);
      toast.error(String(error));
    } finally {
      setProcessingPayment(false);
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

  if (error || !invoiceData || invoiceData.status === "DELETED") {
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
              Oops, this invoice isn’t available anymore.
            </span>
            <span className="text-text-primary text-lg">
              Looks like the employer has deleted the invoice. You can reach out to your employer if anything wrong.
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

      <div className="flex flex-col w-full h-screen items-center justify-start bg-background rounded-lg">
        {/* Title */}
        <div className="w-full flex flex-row gap-2 px-7 items-center justify-start">
          <img src="/misc/star-icon.svg" alt="Invoice" />
          <h1 className="text-2xl font-bold">Invoice Link</h1>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-row py-4 px-30">
            {/* Payment Details */}
            <div className="flex-2/5 flex flex-col gap-4">
              {/* Pay with Header */}
              <div className="flex flex-col gap-2 mb-4">
                <p className="font-barlow font-medium text-[32px] text-text-primary">Pay with</p>
                <p className="font-barlow font-medium text-[16px] text-text-secondary">
                  Pay in your preferred chain and currency
                </p>
              </div>

              {/* Payment Card */}
              <div className="border border-primary-divider rounded-2xl p-8 flex flex-col gap-6">
                {/* Network Selection */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(MODAL_IDS.SELECT_NETWORK, { onNetworkSelect: setSelectedNetwork })}
                    className="flex items-center gap-3 px-4 py-3 h-16 w-full text-left cursor-pointer bg-app-background rounded-lg border-b border-primary-divider"
                  >
                    {selectedNetwork && <img src={selectedNetwork.icon} alt="network" className="w-8 h-8" />}
                    <div className="flex-1">
                      <p className="text-text-secondary text-sm">Select network</p>
                      <p className="text-text-primary text-base font-medium">{selectedNetwork?.name || "Network"}</p>
                    </div>
                    <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-6 h-6" />
                  </button>
                </div>

                {/* Token Selection */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(MODAL_IDS.SELECT_TOKEN, { onTokenSelect: setSelectedToken })}
                    className="flex items-center gap-3 px-4 py-3 h-16 w-full text-left cursor-pointer bg-app-background rounded-lg border-b border-primary-divider"
                  >
                    {selectedToken && (
                      <img
                        src={
                          selectedToken.metadata.symbol === "QASH"
                            ? "/q3x-icon.png"
                            : blo(turnBechToHex(selectedToken.faucetId))
                        }
                        alt="token"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-text-secondary text-sm">Select token</p>
                      <p className="text-text-primary text-base font-medium">
                        {selectedToken?.metadata.symbol || "Token"}
                      </p>
                    </div>
                    <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-6 h-6" />
                  </button>
                </div>

                {/* Amount Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-4 py-3 h-16 w-full bg-app-background rounded-lg border-b border-primary-divider">
                    <div className="flex-1">
                      <p className="text-text-secondary text-sm leading-none mb-1">Total Amount</p>
                      <p className="text-text-primary text-base font-medium">{invoiceData?.total || "0"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-text-primary text-base font-medium">
                        {selectedToken?.metadata.symbol || invoiceData?.currency}
                      </p>
                      {/* <button
                          type="button"
                          className="px-4 py-1 text-sm font-medium text-text-primary bg-app-background rounded border border-primary-divider hover:bg-gray-50 transition-colors"
                        >
                          Max
                        </button> */}
                    </div>
                  </div>
                  {/* <div className="text-xs text-text-secondary text-right">
                      Available: 20,000 {selectedToken?.metadata.symbol}
                    </div> */}
                </div>

                {/* Pay Button */}
                {walletAddress ? (
                  <PrimaryButton
                    text="Pay now"
                    onClick={handlePayNow}
                    containerClassName="w-full"
                    disabled={!selectedNetwork || !selectedToken || processingPayment}
                    loading={processingPayment}
                  />
                ) : (
                  <PrimaryButton text="Connect Wallet" onClick={openParaModal} containerClassName="w-full" />
                )}
              </div>

              {/* Summary Cards */}
              <div
                className="border border-primary-divider rounded-lg bg-background p-6"
                style={{
                  backgroundImage: `url(/card/background.svg)`,
                  backgroundSize: "contain",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <p className="text-text-secondary text-sm">Total amount</p>
                <div className="flex items-center gap-2">
                  {selectedToken && (
                    <img
                      src={
                        selectedToken.metadata.symbol === "QASH"
                          ? "/q3x-icon.png"
                          : blo(turnBechToHex(selectedToken.faucetId))
                      }
                      alt="token"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <p className="text-text-primary text-2xl font-medium">
                    {invoiceData?.total || "0"} {selectedToken?.metadata.symbol || invoiceData?.currency}
                  </p>
                </div>
              </div>

              {/* Transaction Routing */}
              {/* <div className="border border-primary-divider rounded-lg bg-background p-6">
                  <button type="button" className="flex items-center justify-between w-full text-left">
                    <p className="text-text-primary text-base font-medium">Transaction Routing Path</p>
                    <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-6 h-6" />
                  </button>
                </div> */}
            </div>

            {/* Invoice Preview */}
            <div className="flex-3/5">
              <InvoicePreview {...invoiceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
