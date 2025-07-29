import * as React from "react";

interface StatusCardProps {
  title?: string;
  value: string;
  hasTimer?: boolean;
  hasBackground?: boolean;
  backgroundImage?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, value, hasTimer = false, hasBackground = true }) => {
  return (
    <article className="overflow-hidden flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60">
      <div className="flex text-Grey-50 text-lg font-normal font-['Barlow'] mx-[10px] mt-[10px]">{title}</div>
      <div className="rounded-[10px] w-[97%] mt-[5px] flex justify-center items-center h-[105px] ml-[5px] bg-black">
        <div
          className="absolute"
          style={{
            backgroundImage: "url('/cancel-card-background.svg')",
            backgroundSize: "cover",
            backgroundPosition: "left",
            width: "20%",
            height: "7.25%",
          }}
        ></div>
        <div className="font-bold text-4xl font-repetition-scrolling">{value}</div>
      </div>
    </article>
  );
};
