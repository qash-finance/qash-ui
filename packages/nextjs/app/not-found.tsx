"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SecondaryButton } from "../components/Common/SecondaryButton";

export default function NotFound() {
  const router = useRouter();

  const generateRandomColor = () => {
    const colors = ["#E9358F", "#3FDEC9", "#335CFF", "#FF9A68", "#7D52F4", "#FFD268"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const InfinityBannerContainer = () => {
    const bannerItems = Array.from({ length: 40 }, (_, index) => (
      <React.Fragment key={index}>
        <span className="text-xl font-bold text-[#99C3FF] uppercase whitespace-nowrap anton-regular mx-2">
          QASH.FINANCE
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
          className="w-5 h-5 flex-shrink-0"
        >
          <path
            d="M8.5 0.5C7.32638 6.87501 6.37496 7.82638 0 9C6.37501 10.1736 7.32638 11.125 8.5 17.5C9.67362 11.125 10.625 10.1736 17 9C10.625 7.82638 9.67357 6.87501 8.5 0.5Z"
            fill={generateRandomColor()}
          />
        </svg>
      </React.Fragment>
    ));

    return (
      <div className="w-full bg-primary-blue py-2.5 overflow-hidden">
        <div className="flex items-center gap-1 animate-scroll">{bannerItems}</div>
      </div>
    );
  };

  return (
    <div
      data-testid="not-found"
      className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden z-[9999]"
      style={{
        background: "linear-gradient(180deg, #8BBFFF -21.35%, #F5F5F5 39.13%)",
      }}
    >
      <img
        src="/gift/background-qash-text.svg"
        alt="background-qash-text"
        className="w-[1050px] absolute top-80 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1"
        style={{
          maskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
        }}
      />

      {/* Social media links */}
      <div className="absolute right-[35px] top-[15px] w-fit flex flex-row gap-1">
        {[
          {
            handle: "@qash_finance",
            link: "https://x.com/qash_finance",
            icon: "/social/twitter.svg",
            height: "14.118px",
          },
          { handle: "@qash", link: "https://github.com/q3x", icon: "/social/github.svg", height: "14.694px" },
          { handle: "@q3xfinance", link: "https://t.me/q3xfinance", icon: "/social/telegram.svg", height: "16.579px" },
        ].map(social => (
          <div key={social.link} className="flex items-center gap-1 w-fit bg-[#FFFFFF] rounded-full px-4 py-2">
            <img alt="" className="w-3" src={social.icon} />
            <div className="flex-1 text-[15px]">
              <p
                className="leading-none hover:underline cursor-pointer"
                onClick={() => window.open(social.link, "_blank")}
              >
                {social.handle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10 items-center relative z-10 w-full max-w-2xl">
        <div className="w-full flex flex-col gap-4 items-center">
          <div className="h-[217px] relative w-full flex justify-center">
            <div className="flex flex-row w-[450px] h-full">
              <span className="font-semibold text-[200px] text-primary-blue leading-none">4</span>
              <img src="/logo/3d-qash-coin.svg" alt="404" className="w-200" />
              <span className="font-semibold text-[200px] text-primary-blue leading-none">4</span>
            </div>
          </div>
          <p className="text-[24px] font-medium uppercase text-center w-full">LOOK LIKE YOU’RE LOST</p>
        </div>

        <div className="w-[180px]">
          <SecondaryButton
            text="Take me Home"
            icon="/sidebar/home.svg"
            iconPosition="left"
            onClick={() => router.push("/")}
            variant="dark"
          />
        </div>
      </div>

      <div className="absolute bottom-[30px] w-full">
        <InfinityBannerContainer />
      </div>
    </div>
  );
}
