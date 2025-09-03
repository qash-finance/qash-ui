"use client";

import * as React from "react";
import { GiftRow } from "./GiftRow";
import { useGiftDashboard } from "@/hooks/server/useGiftDashboard";
import SkeletonLoading from "../Common/SkeletonLoading";
import { NoteStatus } from "@/types/note";

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
    <div className="flex flex-col rounded-xl bg-[#1E1E1E] h-full overflow-hidden">
      {isLoadingGiftDashboard ? (
        <div className="w-full h-[150px] px-10 mt-5">
          <SkeletonLoading />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2.5 p-4 pb-3 flex-shrink-0">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-medium text-white">Gift sent</h2>
              <p className="text-base text-neutral-500 leading-5">
                Once you accept, you're committing to send the amount to the request address
              </p>
            </div>

            {/* Stats Cards Container */}
            <div className="h-[180px] flex gap-1.5  md:flex-row flex-col md:gap-1.5">
              {/* Total gift value sent */}
              <div className="w-[85%] relative flex flex-col justify-between p-4 rounded-xl gift-background flex-1 min-h-32 overflow-hidden">
                <h3 className="text-base text-neutral-700 leading-5">Total gift value sent</h3>
                <div className="text-5xl font-medium text-black sm:text-5xl leading-tight">
                  $ {giftDashboard?.totalAmount}
                </div>
                {/* Decorative flowers */}

                <img src="/gift/gift.svg" alt="" className="absolute top-6 right-0 scale-[135%]" aria-hidden="true" />
              </div>

              {/* Gift opened */}
              <div
                style={{
                  backgroundImage: "url('/gift/gift-opened.png')",
                  backgroundPosition: "top",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}
                className="w-[15%] relative flex flex-col justify-between items-left p-3 rounded-xl  overflow-hidden"
              >
                <h3 className="relative text-base text-black leading-5 z-10">Gift opened</h3>
                <div className="relative font-medium text-white z-10 text-6xl">{giftDashboard?.totalOpenedGifts}</div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-2 px-4 flex-shrink-0">
            <div className="py-2 px-3.5  text-amber-500 bg-amber-900/30 rounded-md backdrop-blur-sm text-center sm:text-base text-sm leading-5">
              Anyone with the link can get the fund. Do not share it publicly, be careful!
            </div>
          </div>

          {/* Transaction List */}
          {giftDashboard && giftDashboard?.gifts.length > 0 ? (
            <div className="flex flex-col gap-1 overflow-y-auto px-4 flex-1 min-h-0">
              {giftDashboard.gifts.map((gift, index) => (
                <GiftRow
                  id={(index + 1).toString()}
                  key={gift.secretHash}
                  assets={gift.assets[0]}
                  dateTime={gift.createdAt}
                  link={`${window.location.origin}/gift/open-gift?code=${encodeURIComponent(gift.secretHash)}`}
                  isOpened={gift.status != NoteStatus.PENDING}
                  onCopyLink={onCopyLink}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
              <img src="/gift/open-gift-icon.svg" alt="open-gift-icon" className="w-25 h-25" />
              <span className="text-[#7C7C7C]">No gifts found</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
