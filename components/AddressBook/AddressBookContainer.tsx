"use client";

import React, { useEffect, useState } from "react";
import { AddressCard } from "./AddressCard";

export function AddressBookContainer() {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setReveal(true);
  }, []);

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      {/* <AddressCard /> */}
      <div className="relative">
        <img src="/address-book/folder.svg" alt="folder" className="relative z-20" />
        <img src="/plus-icon.svg" alt="plus" className="absolute z-20 w-8 h-8 bottom-7 right-[40%] cursor-pointer" />
        <div
          className="absolute top-0 left-0 w-full z-10 overflow-hidden transition-all duration-700"
          style={{
            height: reveal ? "100%" : "0px",
          }}
        >
          <img
            src="/address-book/no-address.gif"
            alt="no-address"
            className="w-20 h-20"
            style={{
              position: "absolute",
              top: "45%",
              left: "47.5%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <span
            className="text-[#7C7C7C]"
            style={{
              position: "absolute",
              top: "55%",
              left: "47.5%",
              transform: "translate(-50%, -50%)",
            }}
          >
            No address
          </span>
          <img src="/address-book/funnel.svg" alt="funnel" className="w-full" />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full z-0 rounded-b-lg transition-all duration-700 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          width: "100%",
          height: reveal ? "250px" : "0px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
