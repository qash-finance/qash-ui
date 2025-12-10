import React from "react";

export default function InputOutlined({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div className="border border-primary-divider flex items-start h-[64px] px-4 py-2 rounded-[12px] w-full flex-col">
      <p className="font-barlow text-[14px] text-text-secondary">{label}</p>
      <input
        className="font-barlow text-[16px] text-text-primary placeholder:text-[#C1C1C1] w-full outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
