"use client";
import React from "react";

export enum BadgeStatus {
  SUCCESS = "success",
  PRIVATE = "private",
  PUBLIC = "public",
}

interface BadgeProps {
  status: BadgeStatus;
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, text = status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case BadgeStatus.SUCCESS:
        return "bg-badge-success-background text-badge-success-text border-badge-success-border";
      case BadgeStatus.PRIVATE:
        return "bg-badge-private-background text-badge-private-text border-badge-private-border";
      case BadgeStatus.PUBLIC:
        return "bg-badge-public-background text-badge-public-text border-badge-public-border";
      default:
        return "";
    }
  };

  return (
    <div className={`flex justify-center items-center px-2 py-1 rounded-full border ${getStatusStyles()}`}>
      <span className={`text-xs leading-none ${getStatusStyles()} font-bold`}>{text}</span>
    </div>
  );
};
