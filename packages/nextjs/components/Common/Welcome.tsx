import { usePathname } from "next/navigation";
import React from "react";

export default function Welcome() {
  const route = usePathname();

  return (
    <div className="flex flex-col w-1/2 justify-end items-start bg-[#194BFA] rounded-[20px] p-10 relative gap-20">
      <img src="/logo/qash-light.svg" alt="Logo" className="w-[120px] absolute top-10 left-10" />
      <img src="/login/half-circle-login-background-1.svg" alt="Logo" className="w-130 absolute top-0 right-0" />
      <img src="/login/half-circle-login-background-2.svg" alt="Logo" className="w-100 absolute bottom-0 left-0" />
      <img src="/login/square-icon.svg" alt="Logo" className="w-20 absolute top-60 left-60" />
      <img src="/login/square-icon.svg" alt="Logo" className="w-10 absolute bottom-90 right-60" />

      {route === "/login" && (
        <div className="w-full flex justify-center items-center">
          <img src="/login/payroll-mockup.svg" alt="payroll-mockup.svg" className="w-[95%]" />
        </div>
      )}

      <div className="w-[460px] flex flex-col justify-center items-start text-left mb-8">
        <h1 className="text-white text-[40px] font-normal mb-4 leading-13">
          Private banking solution built for global businesses
        </h1>
        <span className="text-white text-[18px] font-light">
          A platform to run payroll, earn yield, and spend across chains and currencies without exposing sensitive
          information onchain
        </span>
      </div>
    </div>
  );
}
