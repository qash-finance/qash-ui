import React from "react";

export const EmptyBatch = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full h-[400px] bg-[#292929] rounded-b-2xl">
      <img src="/sidebar/gift.gif" alt="empty-batch" className="w-16 h-16 grayscale" />
      <span className="text-base leading-5 text-[#93989F]">No transactions found</span>
    </div>
  );
};
