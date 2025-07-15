"use client";
import * as React from "react";

interface ActionButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ text, disabled = false, onClick, className }) => {
  return (
    <button
      className={`font-barlow font-medium text-white transition-colors cursor-pointer ${className} ${
        disabled ? "bg-blue-900 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
      }`}
      style={{
        padding: "6px 10px 8px 10px",
        borderRadius: "10px",
        fontWeight: "500",
        letterSpacing: "-0.084px",
        lineHeight: "100%",
        boxShadow: "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
