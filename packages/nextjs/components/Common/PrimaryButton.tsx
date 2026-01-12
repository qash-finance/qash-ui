"use client";
import React from "react";

interface PrimaryButtonProps {
  text: string;
  icon?: string;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
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
  type = "button",
  containerClassName,
  iconClassName,
  buttonClassName,
  disabled,
  loading,
}: PrimaryButtonProps) => {
  return (
    <div
      className={`p-0.5 rounded-[10px] justify-center items-center ${containerClassName || "w-full"}`}
      style={{
        background: disabled ? "var(--primary-button-disabled-background)" : "var(--primary-button-background)",
      }}
    >
      <button
        type={type}
        className={`w-full flex gap-2 items-center justify-center rounded-lg py-1.5 border-t-2 ${buttonClassName}`}
        style={{
          background: disabled ? "var(--primary-button-disabled)" : "var(--primary-button)",
          borderTopColor: disabled ? "var(--primary-button-disabled-border-top)" : "var(--primary-button-border-top)",
          color: disabled ? "var(--primary-button-disabled-text)" : "var(--primary-button-text)",
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <img src="/loading-square.gif" alt="loading" className="w-6 h-6" />
        ) : (
          <>
            {icon && iconPosition === "left" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
            <span className="text-[14px]">{text}</span>
            {icon && iconPosition === "right" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
          </>
        )}
      </button>
    </div>
  );
};
