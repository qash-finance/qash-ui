"use client";
import React, { useState } from "react";
import { ActionButton } from "../Common/ActionButton";

const OpenGiftContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      <div className="relative">
        <img src="/gift/flower.png" alt="" className="absolute rotate-[10deg] w-40 h-40 z-10" aria-hidden="true" />
        <img src="/gift/flower.png" alt="" className="rotate-[99deg] blur-[45px] w-40 h-40" aria-hidden="true" />
      </div>
      {!isOpen ? (
        <React.Fragment>
          <span
            className="text-white text-[80px] text-center font-dfvn "
            style={{
              textShadow:
                "-3px -3px 0 #1E8FFF, -3px 0 0 #1E8FFF, -3px 3px 0 #1E8FFF, 0 -3px 0 #1E8FFF, 0 3px 0 #1E8FFF, 3px -3px 0 #1E8FFF, 3px 0 0 #1E8FFF, 3px 3px 0 #1E8FFF, -2px -2px 0 #1E8FFF, -2px 0 0 #1E8FFF, -2px 2px 0 #1E8FFF, 0 -2px 0 #1E8FFF, 0 2px 0 #1E8FFF, 2px -2px 0 #1E8FFF, 2px 0 0 #1E8FFF, 2px 2px 0 #1E8FFF, -1px -1px 0 #1E8FFF, -1px 0 0 #1E8FFF, -1px 1px 0 #1E8FFF, 0 -1px 0 #1E8FFF, 0 1px 0 #1E8FFF, 1px -1px 0 #1E8FFF, 1px 0 0 #1E8FFF, 1px 1px 0 #1E8FFF",
            }}
          >
            Open gift
          </span>
          <span className="text-white text-[24px] w-[610px] text-center mb-5">
            You have a gift sent by: <span className="text-[#B5E0FF]">0xd3...adDe</span>. Please click the "Open gift"
            button below to open and receive the gift. You can only receive it once.
          </span>
          <ActionButton onClick={() => setIsOpen(true)} text="Open gift" className="w-[100px] h-[40px]" />
          <ActionButton onClick={() => setIsOpen(true)} text="Connect wallet" className="w-[130px] h-[40px]" />
          <span className="text-[#989898] text-[16px] text-center mt-5">
            Don't have wallet?{" "}
            <span
              className="text-white cursor-pointer"
              onClick={() =>
                window.open(
                  "https://chromewebstore.google.com/detail/ablmompanofnodfdkgchkpmphailefpb?utm_source=item-share-cb",
                  "_blank",
                )
              }
            >
              Download it here
            </span>
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <span
            className="text-white text-[80px] text-center font-dfvn mb-5"
            style={{
              textShadow:
                "-3px -3px 0 #1E8FFF, -3px 0 0 #1E8FFF, -3px 3px 0 #1E8FFF, 0 -3px 0 #1E8FFF, 0 3px 0 #1E8FFF, 3px -3px 0 #1E8FFF, 3px 0 0 #1E8FFF, 3px 3px 0 #1E8FFF, -2px -2px 0 #1E8FFF, -2px 0 0 #1E8FFF, -2px 2px 0 #1E8FFF, 0 -2px 0 #1E8FFF, 0 2px 0 #1E8FFF, 2px -2px 0 #1E8FFF, 2px 0 0 #1E8FFF, 2px 2px 0 #1E8FFF, -1px -1px 0 #1E8FFF, -1px 0 0 #1E8FFF, -1px 1px 0 #1E8FFF, 0 -1px 0 #1E8FFF, 0 1px 0 #1E8FFF, 1px -1px 0 #1E8FFF, 1px 0 0 #1E8FFF, 1px 1px 0 #1E8FFF",
            }}
          >
            congrats!
          </span>
          <span className="text-white text-[80px] text-center font-dfvn leading-[50px]">you have received</span>
          <span
            className="text-white text-[80px] text-center font-dfvn "
            style={{
              textShadow:
                "-3px -3px 0 #1E8FFF, -3px 0 0 #1E8FFF, -3px 3px 0 #1E8FFF, 0 -3px 0 #1E8FFF, 0 3px 0 #1E8FFF, 3px -3px 0 #1E8FFF, 3px 0 0 #1E8FFF, 3px 3px 0 #1E8FFF, -2px -2px 0 #1E8FFF, -2px 0 0 #1E8FFF, -2px 2px 0 #1E8FFF, 0 -2px 0 #1E8FFF, 0 2px 0 #1E8FFF, 2px -2px 0 #1E8FFF, 2px 0 0 #1E8FFF, 2px 2px 0 #1E8FFF, -1px -1px 0 #1E8FFF, -1px 0 0 #1E8FFF, -1px 1px 0 #1E8FFF, 0 -1px 0 #1E8FFF, 0 1px 0 #1E8FFF, 1px -1px 0 #1E8FFF, 1px 0 0 #1E8FFF, 1px 1px 0 #1E8FFF",
            }}
          >
            120,000 usdt
          </span>
          <ActionButton onClick={() => {}} text="Go back" type="neutral" className="w-[100px] h-[40px]" />
        </React.Fragment>
      )}
    </div>
  );
};

export default OpenGiftContainer;
