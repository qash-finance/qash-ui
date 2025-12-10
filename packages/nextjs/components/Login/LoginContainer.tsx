"use client";
import React, { useState } from "react";
import LoginButton from "./LoginButton";
import Welcome from "../Common/Welcome";
import OtpInput from "react-otp-input";
import InputOutlined from "../Common/Input/InputOutlined";

type Step = "email" | "otp";

export default function LoginContainer() {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [otpError, setOtpError] = useState(false);

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
                  Welcome to Qash - Let get stared
                </p>
              </div>
              <InputOutlined label="Email" placeholder="@mail.com" />
              <LoginButton />
            </div>
          </>
        );
      case "otp":
        return (
          <>
            <Welcome />

            <div className="flex flex-col justify-center items-center w-1/2 h-full px-50 relative">
              <div
                className="absolute top-10 left-10 flex flex-row gap-2 items-center justify-center"
                onClick={() => setStep("email")}
              >
                <img src="/arrow/chevron-left-blue.svg" alt="back" className="w-6" />
                <span className="font-barlow font-medium text-[16px] text-primary-blue cursor-pointer ">Back</span>
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
              <LoginButton />
              <span className="text-[18px] text-primary-blue mt-4 cursor-pointer">Resend OTP</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return <div className="flex flex-row w-full h-full p-5 bg-background">{renderStep()}</div>;
}
