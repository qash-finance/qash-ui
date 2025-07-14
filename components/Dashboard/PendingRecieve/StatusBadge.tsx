import * as React from "react";

interface StatusBadgeProps {
  status: "succeed" | "failed";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isSuccess = status === "succeed";

  return (
    <div
      className={`flex gap-0.5 justify-center items-center self-stretch px-2 py-2 rounded-2xl ${
        isSuccess ? "bg-[#18331E] bg-opacity-20" : "bg-[#4E2323] bg-opacity-20"
      }`}
    >
      <span
        className={`text-xs font-medium tracking-tight leading-4 max-sm:text-xs ${isSuccess ? "text-[#6CFF85]" : "text-[#FF3F3F]"}`}
      >
        {isSuccess ? "Succeed" : "Failed"}
      </span>
    </div>
  );
};
