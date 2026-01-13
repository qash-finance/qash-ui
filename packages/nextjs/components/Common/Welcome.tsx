import { usePathname } from "next/navigation";
import React from "react";

export default function Welcome() {
  const route = usePathname();

  return (
    <div className="flex flex-col w-full h-full justify-end items-start bg-[#194BFA] rounded-[20px] p-10 relative gap-20 overflow-hidden">
      {/* Logo - fixed position from top-left */}
      <img src="/logo/qash-light.svg" alt="Logo" className="w-[120px] absolute top-10 left-10" />

      {/* Decorative elements - fixed sizes and positions */}
      <img src="/login/half-circle-login-background-1.svg" alt="" className="w-[520px] absolute top-0 right-0" />
      <img src="/login/half-circle-login-background-2.svg" alt="" className="w-[400px] absolute bottom-0 left-0" />
      <img src="/login/square-icon.svg" alt="" className="w-20 absolute top-60 left-60" />
      <img src="/login/square-icon.svg" alt="" className="w-10 absolute bottom-[360px] right-60" />

      {route === "/login" && (
        <div className="relative w-full flex justify-center items-center flex-1">
          <img
            src="/login/payroll-mockup.svg"
            alt="payroll-mockup"
            className="
              w-full
              min-[1200px]:w-[850px]
            "
          />
        </div>
      )}

      <div
        className="
          flex flex-col justify-center items-start text-left mb-8
          w-[260px]
          min-[1024px]:w-[280px]
          min-[1080px]:w-[300px]
          min-[1140px]:w-[320px]
          min-[1200px]:w-[340px]
          min-[1280px]:w-[360px]
          min-[1366px]:w-[380px]
          min-[1440px]:w-[400px]
          min-[1536px]:w-[420px]
          min-[1600px]:w-[440px]
          min-[1680px]:w-[460px]
          min-[1792px]:w-[480px]
          min-[1920px]:w-[500px]
          min-[2048px]:w-[540px]
          min-[2560px]:w-[600px]
        "
      >
        <h1
          className="
            text-white font-normal mb-4
            text-[24px] leading-[32px]
            min-[1024px]:text-[26px] min-[1024px]:leading-[34px]
            min-[1080px]:text-[28px] min-[1080px]:leading-[36px]
            min-[1140px]:text-[30px] min-[1140px]:leading-[38px]
            min-[1200px]:text-[32px] min-[1200px]:leading-[40px]
            min-[1280px]:text-[34px] min-[1280px]:leading-[42px]
            min-[1366px]:text-[36px] min-[1366px]:leading-[44px]
            min-[1440px]:text-[38px] min-[1440px]:leading-[48px]
            min-[1536px]:text-[40px] min-[1536px]:leading-[50px]
            min-[1600px]:text-[40px] min-[1600px]:leading-[52px]
            min-[1680px]:text-[40px] min-[1680px]:leading-[52px]
            min-[1920px]:text-[44px] min-[1920px]:leading-[56px]
            min-[2560px]:text-[48px] min-[2560px]:leading-[60px]
          "
        >
          Private banking solution built for global businesses
        </h1>
        <span
          className="
            text-white font-light
            text-[14px]
            min-[1024px]:text-[14px]
            min-[1140px]:text-[15px]
            min-[1280px]:text-[16px]
            min-[1440px]:text-[17px]
            min-[1600px]:text-[18px]
            min-[1920px]:text-[20px]
            min-[2560px]:text-[22px]
          "
        >
          A platform to run payroll, earn yield, and spend across chains and currencies without exposing sensitive
          information onchain
        </span>
      </div>
    </div>
  );
}
