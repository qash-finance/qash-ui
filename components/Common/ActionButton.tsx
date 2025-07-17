"use client";
import * as React from "react";

interface ActionButtonProps {
  text: string;
  type?: "accept" | "deny" | "neutral";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 
 * @param param0 
 * <button
          className="flex gap-1.5 justify-center items-center px-2.5 pt-1.5 pb-2 bg-[#FF2323] rounded-xl shadow"
          style={{
            padding: "6px 10px 8px 10px",
            borderRadius: "10px",
            fontWeight: "500",
            letterSpacing: "-0.084px",
            lineHeight: "100%",
            boxShadow:
              "0px 0px 0px 1px #D70000, 0px 1px 3px 0px rgba(143, 9, 9, 0.20), 0px -2.4px 0px 0px #D70000 inset",
          }}
        >
          <span className="text-sm font-medium tracking-normal leading-3 text-white">Remove</span>
        </button>
 * @returns 
 */

export const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  type = "accept",
  disabled = false,
  onClick,
  className,
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case "accept":
        return "bg-blue-500 hover:bg-blue-600";
      case "deny":
        return "bg-[#FF2323] hover:bg-[#D70000]";
      case "neutral":
        return "bg-white hover:bg-white/80";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const getBoxShadow = () => {
    if (disabled)
      return "0px 0px 0px 1px #0F3C8E, 0px 1px 3px 0px rgba(15, 60, 142, 0.20), 0px -2.4px 0px 0px #0F3C8E inset";

    switch (type) {
      case "accept":
        return "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset";
      case "deny":
        return "0px 0px 0px 1px #D70000, 0px 1px 3px 0px rgba(143, 9, 9, 0.20), 0px -2.4px 0px 0px #D70000 inset";
      case "neutral":
        return "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset";
      default:
        return "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset";
    }
  };

  return (
    <button
      className={`font-barlow font-medium text-white transition-colors cursor-pointer ${className} ${
        disabled ? "bg-[#1E578E] cursor-not-allowed text-[#8E8E8E]" : getButtonStyles()
      }`}
      style={{
        padding: "6px 10px 8px 10px",
        borderRadius: "10px",
        fontWeight: "500",
        letterSpacing: "-0.084px",
        lineHeight: "100%",
        boxShadow: getBoxShadow(),
        color: type === "neutral" ? "#066EFF" : "white",
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
