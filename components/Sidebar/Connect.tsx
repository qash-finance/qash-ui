"use client";
import * as React from "react";

interface ConnectProps {
  onConnectWallet?: () => void;
}

export const Connect: React.FC<ConnectProps> = ({ onConnectWallet }) => {
  return (
    <section className="overflow-hidden w-full font-medium bg-white rounded-xl h-[130px] flex items-center justify-center">
      <div className="flex flex-col justify-center px-3 py-2.5 w-full">
        <div className="flex flex-col items-center w-full text-sm tracking-tight leading-none text-blue-600">
          <img src="/q3x-icon.svg" alt="Q3x" className="w-6 h-6 mb-2" />
          <p className="text-blue-600">Welcome to Q3x</p>
        </div>
        <button
          className="flex overflow-hidden gap-1.5 justify-center items-center px-4 pt-3 pb-3.5 mt-1.5 w-full text-base tracking-normal leading-none text-white bg-blue-500 rounded-xl shadow hover:bg-blue-600 transition-colors"
          onClick={onConnectWallet}
          type="button"
        >
          <span className="self-stretch my-auto">Connect Wallet</span>
        </button>
      </div>
    </section>
  );
};
