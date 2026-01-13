import React from "react";
import { Tooltip } from "react-tooltip";

const Card = ({ title, amount, info }: { title: string; amount: string; info?: string }) => {
  return (
    <div className="relative w-full h-full rounded-xl border border-primary-divider p-5 flex flex-col overflow-hidden">
      <div className="flex flex-row gap-2 items-center">
        <span className="text-text-secondary text-sm">{title}</span>
        {info && <img src="/misc/gray-info-icon.svg" alt="info" className="w-3" data-tooltip-id="info-tooltip" />}
      </div>
      <span className="text-text-primary font-semibold text-2xl">{amount}</span>

      <img
        src="/card/background.svg"
        alt=""
        className="absolute -top-3.5 right-5 w-[152px] h-[154px] opacity-80"
        aria-hidden="true"
      />

      <Tooltip
        id="info-tooltip"
        clickable
        style={{
          zIndex: 20,
          borderRadius: "16px",
          padding: "0",
        }}
        place="bottom"
        noArrow
        border="none"
        opacity={1}
        render={() => {
          return (
            <div className="bg-[#444444] p-2 rounded-lg shadow-lg max-w-xs">
              <p className="text-sm text-white ">{info}</p>
            </div>
          );
        }}
      />
    </div>
  );
};

export default Card;
