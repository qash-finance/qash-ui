import React from "react";
import Image from "next/image";

export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute left-0 top-0 h-4 animate-[progress_2s_ease-in-out_infinite] bg-[#066EFF]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/logo/loading.gif"
          alt="Loading"
          width={450}
          height={450}
          priority
          unoptimized
        />
      </div>
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
