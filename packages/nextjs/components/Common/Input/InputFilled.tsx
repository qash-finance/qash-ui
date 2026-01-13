import React from "react";
import { SecondaryButton } from "../SecondaryButton";

interface InputFilled {
  label: string;
  placeholder?: string;
  value?: string;
  error?: boolean;
  type?: string;
  icon?: string;
  optional?: boolean;
  characterLimit?: number;
  iconOnClick?: () => void;
  [key: string]: any; // For react-hook-form register
}

export default function InputFilled({
  label,
  placeholder,
  value,
  error,
  type = "text",
  icon,
  characterLimit,
  optional = false,
  iconOnClick,
  ...rest
}: InputFilled) {
  return (
    <>
      <div
        className={`flex items-center flex-row justify-between h-fit px-4 py-2 rounded-[12px] w-full bg-app-background border-b  ${
          error ? "border-[#E93544]" : "border-primary-divider"
        }`}
      >
        <div className="flex flex-col w-full">
          <p className="font-barlow text-[14px] text-text-secondary">{label}</p>
          {type === "textarea" ? (
            <textarea
              className="font-barlow text-[16px] text-text-primary placeholder:text-[#C1C1C1] w-full outline-none resize-none"
              placeholder={placeholder}
              value={value}
              rows={(rest as any)?.rows ?? 3}
              {...rest}
            />
          ) : (
            <input
              className="font-barlow text-[16px] text-text-primary placeholder:text-[#C1C1C1] w-full outline-none"
              placeholder={placeholder}
              value={value}
              type={type}
              {...rest}
            />
          )}
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

      {(optional || type === "textarea") && (
        <div className="w-full px-2 flex flex-row justify-between">
          {optional && <p className="font-barlow text-xs text-text-secondary">(Optional)</p>}
          {type === "textarea" && (
            <p className="font-barlow text-xs text-text-secondary">
              {((rest as any)?.value as string)?.length ?? 0}/{characterLimit ?? 200}
            </p>
          )}
        </div>
      )}
    </>
  );
}
