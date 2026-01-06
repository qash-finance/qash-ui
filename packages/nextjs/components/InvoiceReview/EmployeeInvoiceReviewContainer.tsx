"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import InvoiceDetail from "./InvoiceDetail";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useInvoice } from "@/hooks/server/useInvoice";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Welcome from "../Common/Welcome";
import { useAuth } from "@/services/auth/context";
import { useModal } from "@/contexts/ModalManagerProvider";
import { ConfirmAndReviewInvoiceModalProps } from "@/types/modal";
import { useModal as useParaModal } from "@getpara/react-sdk";
import { useParaMiden } from "miden-para-react";
import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { useRouter } from "next/navigation";

type Step = "verify" | "review" | "success";

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
    </div>
  );
};

const InvoiceSuccess = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-3 ">
      <img src="/modal/green-circle-check.gif" alt="Invoice Success" className="w-20" />
      <h2 className="text-4xl font-semibold text-text-primary">Invoice sent successfully</h2>
      <p className="text-base text-text-secondary text-center w-[340px]">{message}</p>
    </div>
  );
};

export const EmployeeInvoiceReviewContainer = () => {
  const { openModal, closeModal } = useModal();

  const { isAuthenticated, isLoading: authIsLoading, user, loginWithPara, refreshUser, logout } = useAuth();
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("uuid") || "";
  const employeeEmail = searchParams.get("email") || "";
  const { openModal: openParaModal } = useParaModal();
  const { para } = useParaMiden("https://rpc.testnet.miden.io");
  const { isConnected } = useParaAccount();
  const { logoutAsync } = useMidenProvider();

  const [step, setStep] = useState<Step>("verify");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authenticatingWithPara, setAuthenticatingWithPara] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  const autoReviewKeyRef = useRef<string | null>(null);

  const { isLoading, fetchInvoiceByUUID, confirmInvoiceData, downloadPdf } = useInvoice();

  const handleParaAuthentication = async () => {
    if (!isConnected || !para) {
      toast.error("Please connect your wallet first");
      return;
    }

    setAuthenticatingWithPara(true);
    try {
      // Issue JWT from Para
      const jwtResult = await para.issueJwt();

      if (!jwtResult?.token) {
        throw new Error("Failed to get JWT token from Para");
      }

      console.log("Para JWT issued:", { keyId: jwtResult.keyId });

      // Send JWT to backend
      await loginWithPara(jwtResult.token);

      await refreshUser();

      const email = user?.email || para.email;
      if (email && email.toLowerCase() !== employeeEmail.toLowerCase()) {
        toast.error("The logged in account email does not match the invoice recipient email.");
        return;
      }

      toast.success("Successfully authenticated with Para", {
        id: "para-auth-success",
      });

      // Load invoice data
      await loadInvoice();
      setStep("review");
    } catch (error) {
      console.error("Para authentication failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to authenticate with Para");
    } finally {
      setAuthenticatingWithPara(false);
    }
  };

  const normalizedEmployeeEmail = useMemo(() => employeeEmail.trim().toLowerCase(), [employeeEmail]);
  const normalizedUserEmail = useMemo(() => (user?.email || "").trim().toLowerCase(), [user?.email]);

  const isEmployeeEmailMatch = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!normalizedEmployeeEmail || !normalizedUserEmail) return false;
    return normalizedEmployeeEmail === normalizedUserEmail;
  }, [isAuthenticated, normalizedEmployeeEmail, normalizedUserEmail]);

  // Auto-authenticate when Para connection is established
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authenticatingWithPara) {
      handleParaAuthentication();
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    if (!invoiceUUID || !employeeEmail) return;
    // Don't run auto-review logic until auth has finished initializing.
    if (authIsLoading) return;

    const key = `${invoiceUUID}:${normalizedEmployeeEmail}`;

    // If user is authenticated and email matches: auto move to review
    if (isAuthenticated && isEmployeeEmailMatch) {
      if (autoReviewKeyRef.current === key) return;
      autoReviewKeyRef.current = key;

      (async () => {
        try {
          const data = await fetchInvoiceByUUID(invoiceUUID);
          const mappedData = mapApiResponseToInvoiceData(data);
          setInvoiceData(mappedData);
          setStep("review");
        } catch (err) {
          console.error("Failed to load invoice:", err);
        }
      })();
    }
  }, [authIsLoading, employeeEmail, invoiceUUID, isAuthenticated, isEmployeeEmailMatch, normalizedEmployeeEmail]);

  const loadInvoice = async () => {
    try {
      const data = await fetchInvoiceByUUID(invoiceUUID);
      const mappedData = mapApiResponseToInvoiceData(data);
      setInvoiceData(mappedData);
    } catch (err) {
      console.error("Failed to load invoice:", err);
    }
  };

  const mapApiResponseToInvoiceData = (apiData: any): InvoiceData => {
    // Map API response to InvoiceData interface
    const invoiceNumber = apiData.invoiceNumber;

    const fromDetails = apiData.fromDetails || {};
    const toDetails = apiData.toDetails || apiData.toCompany || {};

    return {
      invoiceNumber: invoiceNumber,
      date: apiData.issueDate ? new Date(apiData.issueDate).toLocaleDateString() : "",
      dueDate: apiData.dueDate ? new Date(apiData.dueDate).toLocaleDateString() : "",
      from: {
        name: fromDetails.name || apiData.employee?.name || "",
        email: fromDetails.email || apiData.emailTo || "",
        company: apiData.payroll?.company?.companyName || "",
        address: fromDetails.address || "",
        network: fromDetails.network?.name || apiData.payroll?.network?.name || "Ethereum",
        token: fromDetails.token?.symbol || apiData.payroll?.token?.symbol || "USD",
        walletAddress: fromDetails.walletAddress || apiData.employee?.walletAddress || "",
      },
      billTo: {
        name: apiData.toCompany?.companyName + " " + apiData.toCompany?.companyType,
        email: toDetails.email,
        company: apiData.toCompany?.companyName || apiData.toCompanyName || "",
        address: [toDetails.address1, toDetails.address2, toDetails.city, toDetails.country, toDetails.postalCode]
          .filter(Boolean)
          .join(", "),
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
    // Check if address has been updated
    if (invoiceData && !invoiceData.from.address) {
      toast.error("Please update the address before confirming the invoice");
      return;
    }

    try {
      openModal<ConfirmAndReviewInvoiceModalProps>("CONFIRM_AND_REVIEW_INVOICE", {
        onConfirm: async () => {
          await confirmInvoiceData(invoiceUUID);
          // close modal
          closeModal("CONFIRM_AND_REVIEW_INVOICE");

          setSuccessMessage("Invoice confirmed successfully");
          setShowSuccess(true);
          // Reload invoice data
          loadInvoice();
        },
      });
    } catch (err) {
      console.error("Failed to confirm invoice:", err);
    }
  };

  const handleAddressUpdate = (updatedAddress: string) => {
    // Update the invoice data when address is updated in InvoiceDetail
    if (invoiceData) {
      setInvoiceData({
        ...invoiceData,
        from: {
          ...invoiceData.from,
          address: updatedAddress,
        },
      });
    }
  };

  const handleWalletAddressUpdate = (updatedWalletAddress: string) => {
    // Update the invoice data when wallet address is updated in InvoiceDetail
    if (invoiceData) {
      setInvoiceData({
        ...invoiceData,
        from: {
          ...invoiceData.from,
          walletAddress: updatedWalletAddress,
        },
      });
    }
  };

  const handleSwitchAccount = async () => {
    setSwitchingAccount(true);
    try {
      await logoutAsync();
      await logout();
      // Reset state to allow re-authentication
      setStep("verify");
      setInvoiceData(null);
      autoReviewKeyRef.current = null;
    } catch (error) {
      console.error("Failed to switch account:", error);
      toast.error("Failed to switch account");
    } finally {
      setSwitchingAccount(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-y-auto">
      {/* Verify OTP Step */}
      {step === "verify" && (
        <div className="flex flex-row w-full h-full p-5 bg-background">
          <Welcome />

          <div className="flex flex-col justify-center items-center w-1/2 h-full px-50 relative">
            <div className="flex flex-col w-full items-center justify-center mb-8">
              <img src="/login/mail-icon.svg" alt="logo" className="w-15" />
              <p className="font-barlow font-medium text-[32px] text-text-primary text-center w-full">
                Verify your identity
              </p>
              {!isAuthenticated && (
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  Connect your wallet to continue.
                </p>
              )}

              {isAuthenticated && isEmployeeEmailMatch && (
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  Loading invoice…
                </p>
              )}

              {isAuthenticated && !isEmployeeEmailMatch && (
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  The logged in account <span className="text-primary-blue">{normalizedUserEmail}</span> does not match
                  the invoice recipient email.
                </p>
              )}
            </div>

            {!isAuthenticated && (
              <PrimaryButton
                onClick={() => {
                  openParaModal?.();
                }}
                text={authenticatingWithPara ? "Authenticating..." : "Connect Wallet"}
                disabled={authenticatingWithPara || authIsLoading}
              />
            )}

            {isAuthenticated && (
              <div className="mt-4">
                <SecondaryButton
                  text={switchingAccount ? "Switching..." : "Switch Account"}
                  onClick={handleSwitchAccount}
                  disabled={switchingAccount || authenticatingWithPara}
                  variant="light"
                  buttonClassName="w-[200px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* if invoice is deleted, show its not active anymore */}
      {invoiceData?.status === "DELETED" && (
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
      )}

      {/* Review Step */}
      {step === "review" && invoiceData && !showSuccess && invoiceData.status !== "DELETED" && (
        <>
          <div className="flex flex-row w-full justify-between items-center px-4 py-3 border-b border-primary-divider">
            <div className="flex flex-row items-center gap-2">
              <img src="/invoice/invoice-icon.svg" alt="Logo" />
              <span className="text-[16px] text-text-primary">Invoice Review</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              {/* TODO: Add download PDF button */}
              {/* <SecondaryButton
                text="Download PDF"
                onClick={handleDownloadPdf}
                variant="light"
                buttonClassName="w-[170px]"
                icon="/invoice/download-invoice-icon.svg"
                iconPosition="left"
                disabled={isLoading}
              /> */}
              {(invoiceData.status === "REVIEWED" || invoiceData.status === "SENT") && (
                <PrimaryButton
                  text="Confirm"
                  onClick={handleConfirmInvoice}
                  containerClassName="w-[170px]"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-row w-full">
            <InvoiceDetail
              {...invoiceData}
              onAddressUpdate={handleAddressUpdate}
              onWalletAddressUpdate={handleWalletAddressUpdate}
            />
            <div className="w-1/2">
              <InvoicePreview {...invoiceData} />
            </div>
          </div>
        </>
      )}

      {/* Success State */}
      {showSuccess && <InvoiceSuccess message={successMessage} />}
    </div>
  );
};
