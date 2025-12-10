import React from "react";

export default function LoginButton() {
  return (
    <button className="bg-primary-blue flex items-center justify-center h-[47px] rounded-[16px] shadow-lg w-full cursor-pointer gap-2 mt-4">
      <span className="text-[14px] text-white text-center">Next</span>
      <img src="/arrow/thin-arrow-left.svg" alt="arrow-right" className="w-[20px] h-[20px] invert-100 rotate-180" />
    </button>
  );
}
