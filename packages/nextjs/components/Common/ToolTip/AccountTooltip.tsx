"use client";
import { AuthMeResponse } from "@/services/auth/api";
import { useAuth } from "@/services/auth/context";
import React from "react";

interface AccountTooltipProps {
  onLogout?: () => void;
}

const TooltipItem = ({
  children,
  onClick,
  className = "",
  isFirst = false,
  isLast = false,
  isActive = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
}) => (
  <div
    className={`
      flex items-center gap-2 px-3 py-3 w-full cursor-pointer 
      transition-colors duration-200
      ${isFirst ? "rounded-t-2xl" : ""}
      ${isLast ? "rounded-b-2xl" : ""}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

export const AccountTooltip = ({ onLogout }: AccountTooltipProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-primary-divider rounded-2xl shadow-lg w-[185px]">
      {/* Support Button */}
      <TooltipItem>
        <div className="flex flex-col gap-1">
          <span className="text-text-primary leading-none">
            {(user as AuthMeResponse["user"])?.teamMembership?.firstName}{" "}
            {(user as AuthMeResponse["user"])?.teamMembership?.lastName}
          </span>
          <span className="text-text-secondary leading-none">{(user as AuthMeResponse["user"])?.email}</span>
        </div>
      </TooltipItem>

      {/* Support Button */}
      <TooltipItem onClick={() => window.open("https://forms.gle/gtvo66cQux4a7BCe9", "_blank")}>
        <span className={`text-sm text-text-primary`}>Support</span>
      </TooltipItem>

      {/* Logout Button */}
      <div className="border-t w-full border-primary-divider">
        <TooltipItem onClick={onLogout} isLast>
          <img src="/misc/power-button-icon.svg" alt="power button" className="w-5 h-5" />
          <span className={`text-sm text-[#E93544]`}>Logout</span>
        </TooltipItem>
      </div>
    </div>
  );
};
