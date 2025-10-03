import React from "react";

const Card = ({ title, amount }: { title: string; amount: string }) => {
  return (
    <div className="relative w-full h-full rounded-xl border border-primary-divider p-5 flex flex-col overflow-hidden">
      <span className="text-text-secondary text-sm">{title}</span>
      <span className="text-text-primary font-semibold text-2xl">{amount}</span>

      <img
        src="/card/background.svg"
        alt=""
        className="absolute -top-3.5 right-5 w-[152px] h-[154px] opacity-80"
        aria-hidden="true"
      />
    </div>
  );
};

export default Card;
