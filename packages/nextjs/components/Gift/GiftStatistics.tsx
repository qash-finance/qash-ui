"use client";

import * as React from "react";
import { GiftRow } from "./GiftRow";
import { useGiftDashboard } from "@/hooks/server/useGiftDashboard";
import SkeletonLoading from "../Common/SkeletonLoading";
import { NoteStatus } from "@/types/note";
import { GiftCreationForm } from "./GiftCreationForm";

interface Transaction {
  id: string;
  amount: string;
  dateTime: string;
  link: string;
  isOpened?: boolean;
}

interface GiftStatisticsProps {
  totalValue?: string;
  giftOpenedCount?: string;
  transactions?: Transaction[];
  onCopyLink?: (link: string) => void;
}

export const GiftStatistics: React.FC<GiftStatisticsProps> = ({ onCopyLink }) => {
  const { data: giftDashboard, isLoading: isLoadingGiftDashboard } = useGiftDashboard();
  return (
    <div className="flex flex-col h-full overflow-hidden w-full gap-4">
      {isLoadingGiftDashboard ? (
        <div className="w-full h-[150px] px-10 mt-5">
          <SkeletonLoading />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2.5 px-5">
            {/* Stats Cards Container */}
            <div className="h-[180px] flex gap-5 flex-row ">
              {/* Total gift value sent */}
              <div
                className="w-[65%] relative flex flex-col justify-between p-4 rounded-[20px] flex-1 border-b-2 border-[#A7C700]"
                style={{
                  background: "linear-gradient(93deg, #F8FFD2 24.2%, #C6DA5A 115.85%)",
                }}
              >
                <div
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #BDE06B",
                    background: "#EEFF94",
                    boxShadow: "0 -2px 2px 0 #C9ED5E inset, 0 4px 4px 0 rgba(0, 0, 0, 0.20)",
                  }}
                  className="w-fit px-3 py-2 mb-2 flex items-center gap-2 absolute top-6 -left-2"
                >
                  <img src="/misc/coin-icon.svg" alt="coin-icon" className="w-5 h-5" />
                  <span className="text-[#8BBF1C] font-semibold">Total gift value sent</span>
                </div>
                {/* <h3 className="text-base text-neutral-700 leading-5"></h3> */}
                <div className="text-5xl text-text-primary absolute bottom-10">$ {giftDashboard?.totalAmount}</div>
                {/* Decorative flowers */}

                <img
                  src="/card/background.svg"
                  alt=""
                  className="absolute top-3 right-5 w-[152px] h-[154px] opacity-40"
                  aria-hidden="true"
                />

                <img
                  src="/gift/otter.svg"
                  alt=""
                  className="absolute -top-5 right-17 w-[195px] h-[195px]"
                  aria-hidden="true"
                />
              </div>

              {/* Gift opened */}
              <div
                style={{
                  background: "linear-gradient(101deg, #CCE3FF 0.74%, #519AFF 105.46%)",
                }}
                className="w-[35%] relative flex flex-col justify-between items-left p-3 rounded-[20px] border-b-2 border-[#1E8FFF]"
              >
                <div
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #5D9DF4",
                    background: "#D5EDFF",
                    boxShadow: "0 -2px 2px 0 #7CB6FF inset, 0 4px 4px 0 rgba(0, 0, 0, 0.20)",
                  }}
                  className="w-fit px-3 py-2 mb-2 flex items-center gap-2 absolute top-6 -left-2"
                >
                  <img src="/gift/blue-open-gift-icon.svg" alt="coin-icon" className="w-5 h-5" />
                  <span className="text-[#5D9DF5] font-semibold">Gift Opened</span>
                </div>
                <div className="text-5xl text-text-primary absolute bottom-10">{giftDashboard?.totalOpenedGifts}</div>
                <img
                  src="/card/background.svg"
                  alt=""
                  className="absolute top-3 right-5 w-[152px] h-[154px] opacity-40"
                  aria-hidden="true"
                />
                <img
                  src="/gift/sea-lion.svg"
                  alt=""
                  className="absolute -top-3 right-9 w-[195px] h-[195px]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="py-2 px-3.5 text-[#1DAF9C] bg-[#CAF4EF] rounded-md backdrop-blur-sm text-center">
            Anyone with the link can get the fund. Do not share it publicly, be careful!
          </div>

          <div className="flex flex-col bg-app-background rounded-3xl p-4 w-full h-full gap-1">
            <span className="text-text-primary text-lg font-semibold">Gift sent</span>
            <span className="text-text-secondary text-sm">
              Once you accept, you're committing to send the amount to the request address
            </span>
            <div className="flex justify-center items-center flex-row gap-2 w-full h-full">
              <span className="text-text-primary text-sm font-semibold w-[75%]">Gift sent</span>
              <GiftCreationForm />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
