"use client";
import * as React from "react";

interface TransactionBadgeProps {
  type: "P2ID-R" | "P2ID";
  className?: string;
}

export function TransactionTypeBadge({ type, className = "" }: TransactionBadgeProps) {
  const isP2IDR = type === "P2ID-R";

  return (
    <div
      className={`flex gap-1 justify-center items-center px-2 py-1 w-16 rounded-xl ${
        isP2IDR ? "bg-white" : "bg-neutral-500"
      } ${className}`}
    >
      <span className={`text-xs font-medium tracking-tight leading-5 ${isP2IDR ? "text-blue-600" : "text-white"}`}>
        {type}
      </span>
    </div>
  );
}
