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

type Step = "email" | "otp";

type EmailForm = {
  email: string;
};

export default function LoginContainer() {
  const router = useRouter();
  const { sendOtp, verifyOtp, isLoading, error, isAuthenticated, accessToken, user } = useAuth();
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [otpError, setOtpError] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const debouncedValidateRef = useRef<DebouncedFunc<(value: string) => void> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create debounced email validation
  useEffect(() => {
    debouncedValidateRef.current = debounce((value: string) => {
      // Perform email format validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        setValidationError("Please enter a valid email address");
        return;
      }
      if (value.includes(",")) {
        setValidationError("Please enter a valid email address");
        return;
      }
      setValidationError(null);
    }, 1000); // 1000ms debounce delay

    return () => {
      debouncedValidateRef.current?.cancel();
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const email = watch("email");

  const onSubmitEmail = async ({ email }: EmailForm) => {
    const normalizedEmail = email.trim();
    setSendingOtp(true);

    try {
      await sendOtp(normalizedEmail);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSendOtp = handleSubmit(onSubmitEmail);

  const handleVerifyOtp = async (valueOtp?: string) => {
    const otpToVerify = valueOtp ?? otp;

    if (otpToVerify.length !== 6) {
      setOtpError(true);
      return;
    }

    // Avoid duplicate submissions if already verifying or loading
    if (verifyingOtp || isLoading) return;

    setOtpError(false);
    setVerifyingOtp(true);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setOtpError(true);
      toast.error("Email is missing, please go back and re-enter");
      setVerifyingOtp(false);
      return;
    }

    try {
      const userData = await verifyOtp(normalizedEmail, otpToVerify);
      toast.success("Authentication successful");

      // Use the returned user data to determine destination
      const hasCompany = !!userData?.teamMembership?.companyId || !!userData?.teamMembership?.company;

      // Small delay to ensure state updates are committed before navigation
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(hasCompany ? "/" : "/onboarding");
    } catch (error) {
      setOtpError(true);
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  // Redirect authenticated users away from login
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasCompany = !!(user as User)?.teamMembership?.companyId || !!(user as User)?.teamMembership?.company;
    const destination = hasCompany ? "/" : "/onboarding";

    router.push(destination);
  }, [isAuthenticated, accessToken, user, router]);

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
              <InputOutlined
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
              <LoginButton
                onClick={handleSendOtp}
                loading={sendingOtp || isLoading}
                disabled={!isValid || sendingOtp || isLoading || !!validationError}
              />
            </div>
          </>
        );
      case "otp":
        return (
          <>
            <Welcome />

            <div className="flex flex-col justify-center items-center w-1/2 h-full px-50 relative">
              <div
                className="absolute top-10 left-10 flex flex-row gap-2 items-center justify-center cursor-pointer"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setOtpError(false);
                }}
              >
                <img src="/arrow/chevron-left-blue.svg" alt="back" className="w-6" />
                <span className="font-barlow font-medium text-[16px] text-primary-blue">Back</span>
              </div>

              <div className="flex flex-col w-full items-center justify-center mb-8">
                <img src="/login/mail-icon.svg" alt="logo" className="w-15" />
                <p className="font-barlow font-medium text-[32px] text-text-primary text-center w-full">
                  OTP Sent to Your Email
                </p>
                <p className="font-barlow font-medium text-[16px] text-text-secondary text-center w-full">
                  Check your inbox and enter the code to continue.
                </p>
              </div>
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
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return <div className="flex flex-row w-full h-full p-5 bg-background">{renderStep()}</div>;
}
