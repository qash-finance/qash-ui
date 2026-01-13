"use client";
import React from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-start gap-3">
      <img src="/sidebar/home.svg" alt="Qash" className="w-6 h-6" />
      <span className="text-2xl font-bold">Dashboard</span>
    </div>
  );
};
