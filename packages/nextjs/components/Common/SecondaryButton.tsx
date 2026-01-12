"use client";
import React from "react";

interface SecondaryButtonProps {
  text: string | React.ReactNode;
  icon?: string;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  buttonClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "dark" | "light" | "red";
  closeIcon?: boolean;
  onCloseIconClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const SecondaryButton = ({
  text,
  icon,
  iconPosition,
  onClick,
  buttonClassName,
  iconClassName,
  disabled,
  variant = "dark",
  closeIcon = false,
  onCloseIconClick,
  type = "button",
}: SecondaryButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "light":
        return {
          background: "var(--secondary-light-button-background)",
          borderTopColor: "var(--secondary-light-button-border-top)",
          color: "var(--secondary-light-button-text)",
        };
      case "red":
        return {
          background: "var(--secondary-red-button-background)",
          borderTopColor: "var(--secondary-red-button-border-top)",
          color: "var(--secondary-red-button-text)",
        };
      case "dark":
      default:
        return {
          background: "var(--secondary-dark-button-background)",
          borderTopColor: "var(--secondary-dark-button-border-top)",
          color: "var(--secondary-dark-button-text)",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      type={type}
      className={`transition-opacity duration-300 flex gap-2 items-center justify-center rounded-[8px] py-2 border-t-2 ${buttonClassName || "w-full"}`}
      style={{
        background: variantStyles.background,
        borderTopColor: variantStyles.borderTopColor,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
      {typeof text === "string" ? (
        <span className="text-[14px]" style={{ color: variantStyles.color }}>
          {text}
        </span>
      ) : (
        text
      )}
      {icon && iconPosition === "right" && <img src={icon} alt="Wallet" className={`w-5 h-5 ${iconClassName}`} />}
      {closeIcon && (
        <img
          src="/misc/circle-close-icon.svg"
          alt="Close"
          className={`w-4 h-4 cursor-pointer`}
          onClick={e => {
            e.stopPropagation();
            onCloseIconClick?.();
          }}
        />
      )}
    </button>
  );
};
