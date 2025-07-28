"use client";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { usePathname } from "next/navigation";
import React from "react";

interface FloatingActionButtonProps {
  imgSrc: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  alt?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  imgSrc,
  alt = "Floating action button",
}) => {
  const pathname = usePathname();

  if (pathname.includes("mobile")) {
    return null;
  }

  const { openModal } = useModal();
  const handleClick = () => {
    openModal(MODAL_IDS.ONBOARDING);
  };

  return (
    <button
      className={`fab-free-token cursor-pointer fixed bottom-6 right-6 w-14 h-14 z-50 flex items-center justify-center rounded-full transition-all duration-200 bg-white outline-none `}
      style={{
        boxShadow: "0px 0px 0px 1px #989898, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #989898 inset",
      }}
      onClick={handleClick}
      aria-label={alt}
    >
      <img src={imgSrc} alt={alt} className="w-10 h-10" />
    </button>
  );
};
