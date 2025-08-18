"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { PortfolioModalProps } from "@/types/modal";

const SchedulePaymentSidebar = ({ isOpen, onClose }: ModalProp<PortfolioModalProps>) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the element is rendered before animation starts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return (
    <div
      data-tour="portfolio-section"
      className="portfolio fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out
        ${isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}
      `}
        style={{ zIndex: 1 }}
        onClick={handleClose}
      />
      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-[#1E1E1E] h-full w-[470px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2 }}
      >
        {/* Back Navigation */}
        <nav
          className="flex relative flex-col shrink-0 justify-center items-center self-stretch px-2 py-0 rounded-2xl bg-black w-[42px] cursor-pointer"
          onClick={handleClose}
        >
          <button className="flex absolute justify-center items-center w-7 h-7 top-1/2" aria-label="Close">
            <img src="/close-icon.svg" alt="close-icon" className="w-7 h-7" />
          </button>
        </nav>

        {/* Wallet Header */}
        <div className="flex relative flex-col gap-2 items-start self-stretch flex-[1_0_0]">
          <div>Schedule Payment</div>
        </div>
      </main>
    </div>
  );
};

export default SchedulePaymentSidebar;
