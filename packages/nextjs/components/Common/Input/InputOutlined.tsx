import React from "react";
import { SecondaryButton } from "../SecondaryButton";

interface InputOutlinedProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  type?: string;
  icon?: string;
  iconOnClick?: () => void;
  [key: string]: any; // For react-hook-form register
}

export default function InputOutlined({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  icon,
  iconOnClick,
  ...rest
}: InputOutlinedProps) {
  return (
    <div
      className={`border flex items-center flex-row justify-between h-[64px] px-4 py-2 rounded-[12px] w-full ${
        error ? "border-[#E93544]" : "border-primary-divider"
      }`}
    >
      <div className="flex flex-col w-full">
        <p className="font-barlow text-[14px] text-text-secondary">{label}</p>
        <input
          className="font-barlow text-[16px] text-text-primary placeholder:text-[#C1C1C1] w-full outline-none"
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
  );
}
