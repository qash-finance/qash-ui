import React from "react";
import { PrimaryButton } from "../Common/PrimaryButton";

interface SettingHeaderProps {
  icon: string;
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonDisabled?: boolean;
  buttonClassName?: string;
}

export default function SettingHeader({
  icon,
  title,
  buttonText,
  onButtonClick,
  buttonDisabled = false,
  buttonClassName,
}: SettingHeaderProps) {
  return (
    <div className="flex items-center justify-between px-0 py-4">
      <div className="flex gap-3 items-center">
        <img src={icon} alt={title} className="w-6" />
        <h1 className="font-semibold text-2xl text-text-primary tracking-[-0.48px] leading-none">{title}</h1>
      </div>
      {buttonText && onButtonClick && (
        <PrimaryButton
          onClick={onButtonClick}
          text={buttonText}
          disabled={buttonDisabled}
          containerClassName={buttonClassName}
        />
      )}
    </div>
  );
}
