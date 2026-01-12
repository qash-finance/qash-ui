import React from "react";
import { SecondaryButton } from "../SecondaryButton";

interface InputOutlinedProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  type?: string;
  icon?: string;
  iconOnClick?: () => void;
  size?: "default" | "compact";
  [key: string]: any; // For react-hook-form register
}

export default function InputOutlined({
  label,
  placeholder,
  value,
  onChange,
  error,
  errorMessage,
  type = "text",
  icon,
  iconOnClick,
  size = "default",
  ...rest
}: InputOutlinedProps) {
  const heightClass = size === "compact" ? "h-[52px]" : "h-[64px]";
  const labelSize = size === "compact" ? "text-[12px]" : "text-[14px]";
  const inputSize = size === "compact" ? "text-[14px]" : "text-[16px]";

  return (
    <div className="flex flex-col w-full">
      <div
        className={`border flex items-center flex-row justify-between ${heightClass} px-4 py-2 rounded-[12px] w-full ${
          error ? "border-[#E93544]" : "border-primary-divider"
        }`}
      >
        <div className="flex flex-col w-full">
          <p className={`font-barlow ${labelSize} text-text-secondary`}>{label}</p>
          <input
            className={`font-barlow ${inputSize} text-text-primary placeholder:text-[#C1C1C1] w-full outline-none`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            type={type}
            {...rest}
          />
        </div>

        {icon && (
          <div
            className="bg-[#F6F6F6] border-b-2 border-[#E0E1E5] rounded-lg px-3 py-2 cursor-pointer"
            onClick={iconOnClick}
          >
            <img src={icon} alt="icon" className="w-5" />
          </div>
        )}
      </div>
      {error && errorMessage && (
        <p className="text-[#E93544] text-[12px] mt-1 ml-1">{errorMessage}</p>
      )}
    </div>
  );
}
