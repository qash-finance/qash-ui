"use client";
import React, { useMemo } from "react";

interface ActionButtonProps {
  text: string;
  type?: "accept" | "deny" | "neutral";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  buttonType?: "button" | "submit" | "reset";
  icon?: string;
  iconPosition?: "left" | "right";
}

const BUTTON_STYLES = {
  accept: {
    enabled: {
      bg: "bg-blue-500 hover:bg-blue-600",
      shadow: "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
      color: "white",
    },
    disabled: {
      bg: "bg-[#1E578E]/70",
      shadow: "0px 0px 0px 1px #0F3C8E, 0px 1px 3px 0px rgba(15, 60, 142, 0.20), 0px -2.4px 0px 0px #0F3C8E inset",
      color: "#8E8E8E",
    },
  },
  deny: {
    enabled: {
      bg: "bg-[#FF2323] hover:bg-[#D70000]",
      shadow: "0px 0px 0px 1px #D70000, 0px 1px 3px 0px rgba(143, 9, 9, 0.20), 0px -2.4px 0px 0px #D70000 inset",
      color: "white",
    },
    disabled: {
      bg: "bg-[#8B5A5A]/70",
      shadow: "0px 0px 0px 1px #D70000, 0px 1px 3px 0px rgba(15, 60, 142, 0.20), 0px -2.4px 0px 0px #D70000 inset",
      color: "#8E8E8E",
    },
  },
  neutral: {
    enabled: {
      bg: "bg-white hover:bg-white/80",
      shadow: "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
      color: "#066EFF",
    },
    disabled: {
      bg: "bg-[#E5E5E5]/70",
      shadow: "0px 0px 0px 1px #0F3C8E, 0px 1px 3px 0px rgba(15, 60, 142, 0.20), 0px -2.4px 0px 0px #0F3C8E inset",
      color: "#8E8E8E",
    },
  },
} as const;

export const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  type = "accept",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  buttonType = "button",
  icon,
  iconPosition = "left",
}) => {
  const isDisabled = disabled;
  const buttonStyle = BUTTON_STYLES[type];
  const currentStyle = isDisabled ? buttonStyle.disabled : buttonStyle.enabled;

  const buttonStyles = useMemo(
    () => ({
      padding: "6px 10px 8px 10px",
      fontWeight: "500",
      letterSpacing: "-0.084px",
      lineHeight: "100%",
      boxShadow: currentStyle.shadow,
      color: currentStyle.color,
    }),
    [currentStyle.shadow, currentStyle.color],
  );

  const buttonClasses = useMemo(() => {
    const baseClasses = "font-barlow font-medium transition-colors rounded-[10px]";
    const stateClasses = isDisabled || loading ? "cursor-not-allowed" : "cursor-pointer";

    return `${baseClasses} ${stateClasses} ${currentStyle.bg} ${className}`.trim();
  }, [isDisabled, loading, currentStyle.bg, className]);

  return (
    <button
      type={buttonType}
      className={`${buttonClasses} justify-center items-center flex`}
      style={buttonStyles}
      disabled={isDisabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <img src="/loading-square.gif" alt="loading" className="w-6 h-6" />
      ) : (
        <div className="flex items-center gap-1">
          {icon && iconPosition === "left" && <img src={icon} alt="icon" className="w-4 h-4" />}
          <span>{text}</span>
          {icon && iconPosition === "right" && (
            <img src={icon} alt="icon" className="w-4 h-4" style={{ filter: "invert(1) brightness(1000%)" }} />
          )}
        </div>
      )}
    </button>
  );
};
