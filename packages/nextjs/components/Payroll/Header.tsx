"use client";
import React from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between w-full">
      <div className="flex flex-row items-center justify-center gap-3">
        <img src="/sidebar/payroll.svg" alt="Qash" className="w-6 h-6" />
        <span className="text-2xl font-bold">Payroll</span>
      </div>
      <PrimaryButton
        text="New payroll"
        icon="/misc/plus-icon.svg"
        iconPosition="left"
        onClick={() => {
          router.push("/payroll/create");
        }}
        containerClassName="w-[125px]"
        buttonClassName="py-2.5"
      />
    </div>
  );
};
