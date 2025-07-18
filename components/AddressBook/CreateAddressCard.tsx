import React from "react";
import { ActionButton } from "../Common/ActionButton";

export const CreateAddressCard = () => {
  return (
    <div className="flex flex-col gap-2 w-[250px] bg-[#292929] rounded-2xl p-2">
      <div className="flex flex-row gap-2 items-center">
        <img src="/plus-icon.svg" alt="folder" className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Remember name"
            className="w-full bg-transparent border-none outline-none text-white text-base leading-5"
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full bg-transparent border-none outline-none text-white text-sm leading-4"
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full">
        <ActionButton text="Send" type="neutral" className="w-full flex-4/5" />
        <div className="flex flex-2/6 flex-row gap-1 items-center bg-white rounded-full justify-between pr-2">
          <img src="/token/usdt.svg" alt="token" className="w-8 h-8" />
          <img src="/arrow/filled-arrow-down.svg" alt="token" className="w-4 h-4" style={{ filter: "brightness(0)" }} />
        </div>
      </div>
    </div>
  );
};
