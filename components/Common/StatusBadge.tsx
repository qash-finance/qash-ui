import * as React from "react";

interface StatusBadgeProps {
  status: "succeed" | "failed" | "waiting";
  text: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text = status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "succeed":
        return "bg-[#18331E] bg-opacity-20 text-[#6CFF85]";
      case "failed":
        return "bg-[#4E2323] bg-opacity-20 text-[#FF3F3F]";
      case "waiting":
        return "bg-[#353535] bg-opacity-20 text-[#FFFFFF]";
      default:
        return "";
    }
  };

  return (
    <div className={`flex gap-0.5 justify-center items-center self-stretch px-2 py-2 rounded-2xl ${getStatusStyles()}`}>
      <span className={`text-xs font-medium tracking-tight leading-4 max-sm:text-xs ${getStatusStyles()} capitalize`}>
        {text}
      </span>
    </div>
  );
};
