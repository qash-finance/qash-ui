"use client";

import React from "react";

const ComingSoonBadge = ({ size = "medium" }: { size?: "small" | "medium" }) => {
  const badgeSizeClasses = size === "small" ? "px-3 py-0.5" : "px-4 py-1";
  const badgeTextClasses = size === "small" ? "text-xs" : "text-base";
  return (
    <div className={`bg-[#D2FADC] flex justify-center items-center rounded-full ${badgeSizeClasses}`}>
      <span className={`text-[#007B4B] font-bold ${badgeTextClasses}`}>Coming Soon</span>
    </div>
  );
};

export default ComingSoonBadge;
