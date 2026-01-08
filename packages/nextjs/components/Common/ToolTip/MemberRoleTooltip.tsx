"use client";
import React from "react";

interface MemberRoleTooltipProps {
  currentRole: "Admin" | "Viewer";
  onRoleChange: (role: "Admin" | "Viewer") => void;
}

const RoleItem = ({
  role,
  isActive,
  onClick,
  isFirst = false,
  isLast = false,
}: {
  role: "Admin" | "Viewer";
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  const getRoleIcon = () => {
    if (role === "Admin") {
      return "/misc/green-shield-icon.svg";
    }
    return "/misc/orange-eye-icon.svg";
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-3 w-full cursor-pointer 
        transition-colors duration-200
        ${isFirst ? "rounded-t-2xl" : ""}
        ${isLast ? "rounded-b-2xl" : ""}
        ${isActive ? "bg-app-background" : "hover:bg-app-background/50"}
      `}
      onClick={onClick}
    >
      <img src={getRoleIcon()} alt={role} className="w-5 h-5" />
      <span className={`text-sm font-medium ${isActive ? "text-text-primary font-semibold" : "text-text-secondary"}`}>
        {role}
      </span>
    </div>
  );
};

export const MemberRoleTooltip = ({ currentRole, onRoleChange }: MemberRoleTooltipProps) => {
  return (
    <div className="bg-background border border-primary-divider rounded-2xl shadow-lg w-[160px]">
      {/* Admin Role */}
      <RoleItem role="Admin" isActive={currentRole === "Admin"} onClick={() => onRoleChange("Admin")} isFirst />

      {/* Divider */}
      <div className="border-t w-full border-primary-divider" />

      {/* Viewer Role */}
      <RoleItem role="Viewer" isActive={currentRole === "Viewer"} onClick={() => onRoleChange("Viewer")} isLast />
    </div>
  );
};
