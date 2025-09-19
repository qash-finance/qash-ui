"use client";
import React from "react";

interface PrimaryButtonProps {
  text: string;
  icon?: string;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const PrimaryButton = ({
  text,
  icon,
  iconPosition,
  onClick,
  containerClassName,
  buttonClassName,
}: PrimaryButtonProps) => {
  return (
    <div
      className={`p-0.5 rounded-[10px] justify-center items-center ${containerClassName || "w-full"}`}
      style={{
        background: "var(--primary-button-background)",
      }}
    >
      <button
        className={`cursor-pointer w-full flex gap-2 items-center justify-center bg-primary-button rounded-[8px] py-1.5 border-t-2 border-t-primary-button-border-top ${buttonClassName}`}
        onClick={onClick}
      >
        {icon && iconPosition === "left" && <img src={icon} alt="Wallet" className="w-5 h-5" />}
        <span className="text-primary-button-text text-[14px]">{text}</span>
        {icon && iconPosition === "right" && <img src={icon} alt="Wallet" className="w-5 h-5" />}
      </button>
    </div>
  );
};
