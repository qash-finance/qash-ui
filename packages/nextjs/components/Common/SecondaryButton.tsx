"use client";
import React from "react";

interface SecondaryButtonProps {
  text: string;
  icon?: string;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  buttonClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const SecondaryButton = ({
  text,
  icon,
  iconPosition,
  onClick,
  buttonClassName,
  iconClassName,
}: SecondaryButtonProps) => {
  return (
    <button
      className={`cursor-pointer w-full flex gap-2 items-center justify-center rounded-[8px] py-2 border-t-2 ${buttonClassName}`}
      style={{
        background: "var(--secondary-button-background)",
        borderTopColor: "var(--secondary-button-border-top)",
      }}
      onClick={onClick}
    >
      {icon && iconPosition === "left" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
      <span className="text-[14px]" style={{ color: "var(--secondary-button-text)" }}>
        {text}
      </span>
      {icon && iconPosition === "right" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
    </button>
  );
};
