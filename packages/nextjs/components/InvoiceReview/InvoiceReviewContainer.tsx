"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { PrimaryButton } from "../Common/PrimaryButton";
import InvoiceDetail from "./InvoiceDetail";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useInvoice } from "@/hooks/server/useInvoice";
import { useSearchParams } from "next/navigation";
import OtpInput from "react-otp-input";
import toast from "react-hot-toast";
import Welcome from "../Common/Welcome";
import LoginButton from "../Login/LoginButton";
import { useAuth } from "@/services/auth/context";

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
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  amountDue: number;
  currency: string;
  status: string;
}

const InvoiceSuccess = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-3 ">
      <img src="/modal/green-circle-check.gif" alt="Invoice Success" className="w-20" />
      <h2 className="text-4xl font-semibold text-text-primary">Invoice sent successfully</h2>
      <p className="text-base text-text-secondary text-center w-[340px]">{message}</p>
    </div>
  );
};

export const InvoiceReviewContainer = () => {
  const { isAuthenticated, email, isLoading: authIsLoading, sendOtp, verifyOtp } = useAuth();
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("id") || "";
  const employeeEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>("verify");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const otpSentKeyRef = useRef<string | null>(null);
  const autoReviewKeyRef = useRef<string | null>(null);

  const { isLoading, fetchInvoiceByUUID, confirmInvoiceData, downloadPdf } = useInvoice();

  const normalizedEmployeeEmail = useMemo(() => employeeEmail.trim().toLowerCase(), [employeeEmail]);
  const normalizedUserEmail = useMemo(() => (email || "").trim().toLowerCase(), [email]);

  const isEmployeeEmailMatch = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!normalizedEmployeeEmail || !normalizedUserEmail) return false;
    return normalizedEmployeeEmail === normalizedUserEmail;
  }, [isAuthenticated, normalizedEmployeeEmail, normalizedUserEmail]);

  useEffect(() => {
    if (!invoiceUUID || !employeeEmail) return;
    // Don't run OTP/auto-review logic until auth has finished initializing.
    // Otherwise we may send OTP while a session exists and overwrite stored email.
    if (authIsLoading) return;

    const key = `${invoiceUUID}:${normalizedEmployeeEmail}`;

    // 2) If user is authenticated: don't send OTP
    //    a) If email === employeeEmail: auto move to review
    //    b) If email !== employeeEmail: stay on verify but hide OTP input
    if (isAuthenticated) {
      if (isEmployeeEmailMatch) {
        if (autoReviewKeyRef.current === key) return;
        autoReviewKeyRef.current = key;

        (async () => {
          try {
            const data = await fetchInvoiceByUUID(invoiceUUID);
            setInvoiceData(mapApiResponseToInvoiceData(data));
            setStep("review");
          } catch (err) {
            console.error("Failed to load invoice:", err);
          }
        })();
      }
      return;
    }

    // 1) If user is not authenticated: auto send OTP (once per invoice+email)
    if (otpSentKeyRef.current === key) return;
    otpSentKeyRef.current = key;

    sendOtp(employeeEmail)
      .then(() => {
        toast.success(`OTP sent to ${employeeEmail}`);
      })
      .catch((error: any) => {
        if (error && error.message.includes("Rate limit")) {
          toast.error("Too many requests. Please wait before trying again.");
        } else {
          toast.error("Failed to send OTP");
        }
      });
  }, [
    authIsLoading,
    employeeEmail,
    fetchInvoiceByUUID,
    invoiceUUID,
    isAuthenticated,
    isEmployeeEmailMatch,
    normalizedEmployeeEmail,
    sendOtp,
  ]);

  const loadInvoice = async () => {
    try {
      const data = await fetchInvoiceByUUID(invoiceUUID);
      console.log("🚀 ~ loadInvoice ~ data:", data);
      setInvoiceData(mapApiResponseToInvoiceData(data));
    } catch (err) {
      console.error("Failed to load invoice:", err);
    }
  };

  const handleVerifyOtp = async (valueOtp?: string) => {
    const otpToVerify = valueOtp ?? otp;

    if (otpToVerify.length !== 6) {
      setOtpError(true);
      return;
    }

    setOtpError(false);
    setVerifyingOtp(true);

    try {
      await verifyOtp(employeeEmail, otpToVerify);
      toast.success("OTP verified successfully");
      // Load invoice data and move to review step
      await loadInvoice();
      setStep("review");
    } catch (err) {
      setOtpError(true);
      toast.error(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp(employeeEmail);
      toast.success("OTP sent to your email");
      setOtp("");
      setOtpError(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  const mapApiResponseToInvoiceData = (apiData: any): InvoiceData => {
    // Map API response to InvoiceData interface
    const toDetails = apiData.toDetails || apiData.toCompany || {};
    const fromDetails = apiData.fromDetails || {};

    return {
      invoiceNumber: apiData.invoiceNumber || "",
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
        name: apiData.toCompany?.companyName || apiData.toCompanyName || "",
        email: apiData.toCompanyEmail || apiData.emailTo || "",
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
    try {
      await confirmInvoiceData(invoiceUUID);
      setSuccessMessage("Invoice confirmed successfully");
      setShowSuccess(true);
      // Reload invoice data
      loadInvoice();
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

  console.log(invoiceData);

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
                  We’ve sent a OTP to <span className="text-primary-blue">{employeeEmail}</span> Please enter it to
                  continue.
                </p>
              )}

              {isAuthenticated && isEmployeeEmailMatch && (
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  Loading invoice…
                </p>
              )}

              {isAuthenticated && !isEmployeeEmailMatch && (
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  We’ve sent a OTP to <span className="text-primary-blue">{employeeEmail}</span>.
                </p>
              )}
            </div>

            {!isAuthenticated && (
              <>
                <OtpInput
                  value={otp}
                  onChange={value => {
                    setOtp(value);
                    if (otpError) setOtpError(false);

                    // Auto-submit when OTP is fully entered
                    if (value.length === 6) {
                      handleVerifyOtp(value);
                    }
                  }}
                  numInputs={6}
                  containerStyle={{ gap: "8px" }}
                  inputStyle={{
                    width: "50px",
                    height: "55px",
                    borderRadius: "12px",
                    fontSize: "24px",
                    textAlign: "center",
                    backgroundColor: "#F6F6F6",
                    border: otpError ? "2px solid #E93544" : undefined,
                  }}
                  placeholder=""
                  renderInput={props => <input {...props} />}
                />
                {otpError && <span className="text-[16px] text-[#E93544] my-3">Incorrect code. Please try again.</span>}
                <LoginButton onClick={handleVerifyOtp} loading={verifyingOtp || isLoading} />
                <span className="text-[18px] text-primary-blue mt-4 cursor-pointer" onClick={handleResendOtp}>
                  Resend OTP
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === "review" && invoiceData && !showSuccess && (
        <>
          <div className="flex flex-row w-full justify-between items-center px-4 py-3 border-b border-primary-divider">
            <div className="flex flex-row items-center gap-2">
              <img src="/invoice/invoice-icon.svg" alt="Logo" />
              <span className="text-[16px] text-text-primary">Invoice Review</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <SecondaryButton
                text="Download PDF"
                onClick={handleDownloadPdf}
                variant="light"
                buttonClassName="w-[170px]"
                icon="/invoice/download-invoice-icon.svg"
                iconPosition="left"
                disabled={isLoading}
              />
              {invoiceData.status === "REVIEWED" && (
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
