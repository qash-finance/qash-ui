"use client";
import React, { useState } from "react";
import { ActionButton } from "../Common/ActionButton";

const OpenGiftContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showBlackBg, setShowBlackBg] = useState(false);
  const [showLight, setShowLight] = useState(false);

  const handleGiftClick = () => {
    setIsDropping(true);
    setShowGif(true);
    setShowBlackBg(true);

    // Show light after 1.2 seconds
    setTimeout(() => {
      setShowLight(true);
    }, 1400);
  };

  return (
    <div className="flex w-full h-full justify-center items-center flex-col max-h-screen overflow-y-hidden relative">
      {showBlackBg && <div className="absolute inset-0 bg-black animate-fade-in z-10"></div>}
      <div className="z-[100] relative">
        {!isOpen ? (
          <div className="flex w-full ">
            <div
              className={`w-[20%] mt-[15%] h-full flex items-center justify-center ${isDropping ? "animate-drop-left" : ""}`}
            >
              <img
                src="/gift/open-gift/gift-1.svg"
                alt=""
                draggable="false"
                style={{
                  animation: isDropping ? "none" : "bounce1 1.5s ease-in-out infinite",
                }}
                className="scale-[125%]"
              />
            </div>
            <div
              className={`w-[20%] mt-[20%] flex items-center justify-center ${isDropping ? "animate-drop-top" : ""}`}
            >
              <img
                src="/gift/open-gift/gift-2.svg"
                alt=""
                draggable="false"
                style={{
                  animation: isDropping ? "none" : "bounce2 1.3s ease-in-out infinite",
                }}
                className="scale-[125%]"
              />
            </div>
            <div
              className="cursor-pointer w-[30%] mt-[20%] h-full flex items-center justify-center flex-col"
              onClick={handleGiftClick}
            >
              <div className="flex flex-col justify-center items-center relative">
                {!showGif && (
                  <>
                    <div className="text-white text-3xl font-bold">Click here</div>
                    <img
                      src="/gift/open-gift/gift-arrow-down.gif"
                      alt=""
                      className="mb-2 scale-[150%]"
                      draggable="false"
                    />
                  </>
                )}
                {!showGif && (
                  <>
                    <img
                      src="/gift/open-gift/gift-box.svg"
                      alt=""
                      className="scale-[150%] relative z-10"
                      draggable="false"
                    />
                  </>
                )}
                {showGif && (
                  <div>
                    <img
                      src="/gift/open-gift/gift-open-gif.gif"
                      alt="Gift opening"
                      className="relative scale-[150%] z-[50]"
                      draggable="false"
                    />
                    {showLight && (
                      <div className="absolute top-[20%] left-[-30%] transform -translate-y-1/2 scale-[100%] z-[40] opacity-60 animate-light-height">
                        <img
                          src="/gift/open-gift/light-particle.gif"
                          alt=""
                          className="absolute top-[40%] left-[0%] transform -translate-y-1/2 scale-[100%] z-[10] opacity-10 animate-light-height"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="534"
                          height="461"
                          viewBox="0 0 534 461"
                          fill="none"
                          className="relative z-[50] opacity-80"
                        >
                          <g filter="url(#filter0_f_6776_72099)">
                            <path
                              d="M95.7842 96L196.353 336.531L243.329 365.306L324.357 343.415L437.927 96.0002L95.7842 96Z"
                              fill="url(#paint0_linear_6776_72099)"
                              fillOpacity="0.5"
                            />
                          </g>
                          <defs>
                            <filter
                              id="filter0_f_6776_72099"
                              x="0.184181"
                              y="0.400002"
                              width="533.343"
                              height="460.506"
                              filterUnits="userSpaceOnUse"
                              colorInterpolationFilters="sRGB"
                            >
                              <feFlood floodOpacity="0" result="BackgroundImageFix" />
                              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                              <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur_6776_72099" />
                            </filter>
                            <linearGradient
                              id="paint0_linear_6776_72099"
                              x1="274.078"
                              y1="81.2104"
                              x2="274.078"
                              y2="365.626"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#FFFB00" stopOpacity="0" />
                              <stop offset="1" stopColor="#FFFB00" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}

                    {showLight && (
                      <div className="absolute top-[25%] left-[-10%] transform -translate-y-1/2 scale-[100%] z-[40] opacity-60 animate-light-height">
                        {" "}
                        <span
                          className="text-white text-[80px] text-center font-dfvn mb-5"
                          style={{
                            textShadow:
                              "-3px -3px 0 #1E8FFF, -3px 0 0 #1E8FFF, -3px 3px 0 #1E8FFF, 0 -3px 0 #1E8FFF, 0 3px 0 #1E8FFF, 3px -3px 0 #1E8FFF, 3px 0 0 #1E8FFF, 3px 3px 0 #1E8FFF, -2px -2px 0 #1E8FFF, -2px 0 0 #1E8FFF, -2px 2px 0 #1E8FFF, 0 -2px 0 #1E8FFF, 0 2px 0 #1E8FFF, 2px -2px 0 #1E8FFF, 2px 0 0 #1E8FFF, 2px 2px 0 #1E8FFF, -1px -1px 0 #1E8FFF, -1px 0 0 #1E8FFF, -1px 1px 0 #1E8FFF, 0 -1px 0 #1E8FFF, 0 1px 0 #1E8FFF, 1px -1px 0 #1E8FFF, 1px 0 0 #1E8FFF, 1px 1px 0 #1E8FFF",
                          }}
                        >
                          congrats!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`w-[20%] mt-[25%] h-full flex items-center justify-center ${isDropping ? "animate-drop-right" : ""}`}
            >
              <img
                src="/gift/open-gift/gift-3.svg"
                alt=""
                draggable="false"
                style={{
                  animation: isDropping ? "none" : "bounce4 1.4s ease-in-out infinite",
                }}
                className="scale-[125%]"
              />
            </div>
            <div
              className={`w-[20%] mt-[30%] h-full flex items-center justify-center ${isDropping ? "animate-drop-bottom" : ""}`}
            >
              <img
                src="/gift/open-gift/gift-4.svg"
                alt=""
                draggable="false"
                style={{
                  animation: isDropping ? "none" : "bounce5 1.6s ease-in-out infinite",
                }}
                className="scale-[125%]"
              />
            </div>
          </div>
        ) : (
          <img src="/gift/vault.svg" alt="" className="absolute w-40 h-40 z-10" aria-hidden="true" />
        )}
      </div>

      <style jsx>{`
        @keyframes bounce1 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-65px);
          }
        }
        @keyframes bounce2 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-35px);
          }
        }
        @keyframes bounce3 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-35px);
          }
        }
        @keyframes bounce4 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25px);
          }
        }
        @keyframes bounce5 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-75px);
          }
        }
        @keyframes dropDown {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(250px);
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-drop-left {
          animation: dropDown 0.5s ease-in forwards;
        }
        .animate-drop-top {
          animation: dropDown 0.5s ease-in forwards;
        }
        .animate-drop-right {
          animation: dropDown 0.5s ease-in forwards;
        }
        .animate-drop-bottom {
          animation: dropDown 0.5s ease-in forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out forwards;
        }
        @keyframes lightHeight {
          0% {
            height: 0;
            opacity: 0;
          }
          100% {
            height: 361px;
            opacity: 0.6;
          }
        }
        .animate-light-height {
          animation: lightHeight 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OpenGiftContainer;
