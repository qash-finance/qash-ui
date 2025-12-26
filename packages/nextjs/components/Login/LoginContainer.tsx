"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { debounce, DebouncedFunc } from "lodash";
import LoginButton from "./LoginButton";
import Welcome from "../Common/Welcome";
import OtpInput from "react-otp-input";
import InputOutlined from "../Common/Input/InputOutlined";
import { useAuth } from "@/services/auth/context";
import toast from "react-hot-toast";
import { User } from "@/types/user";
import { useModal as useParaModal } from "@getpara/react-sdk";
import { useParaMiden } from "miden-para-react";
import { useAccount as useParaAccount } from "@getpara/react-sdk";
import { PrimaryButton } from "../Common/PrimaryButton";

type Step = "email" | "otp";

type EmailForm = {
  email: string;
};

export default function LoginContainer() {
  const router = useRouter();
  const { loginWithPara, isLoading, error, isAuthenticated, user, refreshUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [otpError, setOtpError] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [authenticatingWithPara, setAuthenticatingWithPara] = useState(false);
  const debouncedValidateRef = useRef<DebouncedFunc<(value: string) => void> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { openModal: openParaModal } = useParaModal();
  const { para } = useParaMiden("https://rpc.testnet.miden.io");
  const { isConnected } = useParaAccount();

  // Handle Para authentication after connection
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
      const userData = await loginWithPara(jwtResult.token);

      toast.success("Successfully authenticated with Para");

      await refreshUser();

      // Determine destination based on user data
      const hasCompany = !!userData?.teamMembership?.companyId || !!userData?.teamMembership?.company;

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push(hasCompany ? "/payroll" : "/onboarding");
    } catch (error) {
      console.error("Para authentication failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to authenticate with Para");
    } finally {
      setAuthenticatingWithPara(false);
    }
  };

  // Auto-authenticate when Para connection is established
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authenticatingWithPara) {
      handleParaAuthentication();
    }
  }, [isConnected, isAuthenticated]);

  // Redirect authenticated users away from login
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasCompany = !!(user as User)?.teamMembership?.companyId || !!(user as User)?.teamMembership?.company;
    const destination = hasCompany ? "/bill" : "/onboarding";

    router.push(destination);
  }, [isAuthenticated, user, router]);

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <>
            <Welcome />

            <div className="flex flex-col justify-center items-center w-1/2 h-full px-50 relative">
              <div className="flex flex-col w-full items-center justify-center mb-10">
                <img src="/logo/qash-icon.svg" alt="logo" className="w-15" />
                <p className="font-barlow font-medium text-[32px] text-text-primary text-center w-full">
                  Get started now
                </p>
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  Welcome to Qash - Let get started
                </p>
              </div>
              {/* <InputOutlined
                label="Email"
                placeholder="@mail.com"
                error={!!errors.email || !!validationError}
                {...register("email", {
                  required: "Please enter a valid email address",
                  onChange: e => {
                    debouncedValidateRef.current?.(e.target.value);
                  },
                })}
              />
              {validationError && <span className="text-[16px] text-[#E93544] mt-2 self-start">{validationError}</span>}
              {error && <span className="text-[16px] text-[#E93544] mt-2 self-start">{error}</span>}
              <div
                onClick={() => {
                  openParaModal?.();
                }}
                className="p-10 bg-red-500 text-xl text-white"
              >
                CONNECT WITH PARA
              </div>
              <div className="p-10 bg-red-500 text-xl text-white">{isConnected ? "CONNECTED" : "NOT CONNECTED"}</div>
              <div
                onClick={async () => {
                  const jwt = await para?.issueJwt();
                  console.log(jwt);
                }}
                className="p-10 bg-red-500 text-xl text-white"
              >
                LOG JWT TOKEN WITH LOGGED IN USER
              </div>
              <LoginButton
                onClick={handleSendOtp}
                loading={sendingOtp || isLoading}
                disabled={!isValid || sendingOtp || isLoading || !!validationError}
              /> */}
              <PrimaryButton
                onClick={() => {
                  openParaModal?.();
                }}
                text={authenticatingWithPara ? "Authenticating..." : "Continue by email"}
                disabled={authenticatingWithPara || isLoading}
              />
            </div>
          </>
        );
      case "otp":
        return <></>;
      default:
        return null;
    }
  };

  return <div className="flex flex-row w-full h-full p-5 bg-background">{renderStep()}</div>;
}
