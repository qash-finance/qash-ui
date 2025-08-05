"use client";

import * as React from "react";
import { GiftCreationForm } from "./GiftCreationForm";
import { GiftStatistics } from "./GiftStatistics";

export const GiftContainer: React.FC = () => {
  return (
    <main className="custom-scrollbar max-h-screen overflow-y-scroll flex flex-col gap-4 items-center h-full p-4 rounded-2xl bg-[#121212] flex-[1_0_0] max-md:p-3 max-sm:p-2">
      <div className="max-h-[99%] flex gap-4 justify-center items-start self-stretch flex-[1_0_0] max-md:flex-col max-md:gap-3">
        <GiftCreationForm />
        <GiftStatistics />
      </div>
    </main>
  );
};

export default GiftContainer;
