import React from "react";

interface InputOutlinedProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  type?: string;
  [key: string]: any; // For react-hook-form register
}

export default function InputOutlined({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  ...rest
}: InputOutlinedProps) {
  return (
    <div
      className={`border flex items-start h-[64px] px-4 py-2 rounded-[12px] w-full flex-col ${
        error ? "border-[#E93544]" : "border-primary-divider"
      }`}
    >
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
  );
}
