"use client";
import React from "react";

export enum BadgeStatus {
  SUCCESS = "success",
  FAIL = "fail",
  PRIVATE = "private",
  PUBLIC = "public",
  NEUTRAL = "neutral",
  AWAITING = "awaiting",
}

interface BadgeProps {
  status: BadgeStatus;
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, text = status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case BadgeStatus.SUCCESS:
        return "bg-badge-success-background text-badge-success-text border-badge-success-border";
      case BadgeStatus.AWAITING:
        return "bg-badge-awaiting-background text-badge-awaiting-text border-badge-awaiting-border";
      case BadgeStatus.FAIL:
        return "bg-badge-fail-background text-badge-fail-text border-badge-fail-border";
      case BadgeStatus.PRIVATE:
        return "bg-badge-private-background text-badge-private-text border-badge-private-border";
      case BadgeStatus.PUBLIC:
        return "bg-badge-public-background text-badge-public-text border-badge-public-border";
      case BadgeStatus.NEUTRAL:
        return "bg-badge-neutral-background text-badge-neutral-text border-badge-neutral-border";
      default:
        return "";
    }
  };

  return (
    <div className={`flex justify-center items-center px-2 py-1 rounded-full border ${getStatusStyles()} ${className}`}>
      <span className={`text-xs leading-none ${getStatusStyles()} font-bold`}>{text}</span>
    </div>
  );
};
