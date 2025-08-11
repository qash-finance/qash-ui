"use client";
import React, { useEffect, useState } from "react";
import { ActionButton } from "../Common/ActionButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useGiftDetail } from "@/hooks/server/useGiftDetail";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { toast } from "react-hot-toast";
import {
  consumeAllUnauthenticatedNotes,
  consumeUnauthenticatedGiftNote,
  createGiftNote,
  stringToSecretArray,
} from "@/services/utils/miden/note";
import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import useOpenGift from "@/hooks/server/useOpenGift";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

const OpenGiftContainer = () => {
  // **************** Pathname Hooks *******************
  const searchParams = useSearchParams();
  const encodedCode = searchParams.get("code");
  const code = encodedCode ? decodeURIComponent(encodedCode) : "";

  // **************** Custom Hooks *******************
  const { walletAddress } = useWalletConnect();
  const { data: giftDetail, isLoading: isLoadingGiftDetail } = useGiftDetail(code);
  const { mutateAsync: openGift } = useOpenGift();
  const { openModal, closeModal } = useModal();
  const router = useRouter();

  // **************** Local State *******************
  const [isDropping, setIsDropping] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showLight, setShowLight] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleGiftClick = async () => {
    if (!giftDetail) return;

    // Check gift status before proceeding
    if (giftDetail.status === "consumed") {
      toast.error("This gift has already been opened");
      return;
    }

    if (giftDetail.status === "recalled") {
      toast.error("This gift has been recalled by the sender");
      return;
    }

    // Show validating modal
    openModal(MODAL_IDS.VALIDATING);

    try {
      // decode secret number back to array of 4 numbers
      const secret = stringToSecretArray(giftDetail?.secretNumber!);
      // consume the gift
      const [note, _] = await createGiftNote(
        giftDetail?.sender!,
        giftDetail?.assets[0].faucetId!,
        BigInt(Number(giftDetail?.assets[0].amount!) * 10 ** giftDetail?.assets[0].metadata.decimals!),
        secret,
        giftDetail?.serialNumber?.map(Number) as [number, number, number, number],
      );

      const txId = await consumeUnauthenticatedGiftNote(walletAddress, note, secret);

      // Close validating modal
      closeModal(MODAL_IDS.VALIDATING);

      toast.success(
        <div>
          Transaction sent successfully, view transaction on{" "}
          <a href={`${MIDEN_EXPLORER_URL}/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">
            Miden Explorer
          </a>
        </div>,
      );

      // call server endpoint to update gift status
      await openGift({
        secret: code,
        txId,
      });

      setIsDropping(true);
      setShowGif(true);

      // Show light after 1.2 seconds
      setTimeout(() => {
        setShowLight(true);
      }, 1400);
    } catch (error) {
      console.error(error);
      // Close validating modal on error
      closeModal(MODAL_IDS.VALIDATING);

      // Show fail modal
      openModal(MODAL_IDS.FAIL, {
        tryAgain: handleGiftClick,
      });
      toast.error("Failed to open gift");
    }
  };

  // Set loaded state when gift detail is loaded
  useEffect(() => {
    if (!isLoadingGiftDetail && giftDetail) {
      setIsLoaded(true);
    }
  }, [isLoadingGiftDetail, giftDetail]);

  // Show loading state while data is being fetched
  if (isLoadingGiftDetail || !isLoaded) {
    return <></>;
  }

  return (
    <div className="min-w-[880px] flex w-full h-full justify-center items-center flex-col max-h-screen overflow-y-hidden relative">
      {giftDetail?.status !== "consumed" ? (
        <div className="fixed">
          <div className="flex w-full ">
            <div
              className={`w-[20%] mt-[15%] h-full flex items-center justify-center ${isDropping ? "animate-drop-left" : ""}`}
            >
              <img
                src="/gift/open-gift/gift-1.svg"
                alt=""
                draggable="false"
                style={{
                  animation: isDropping ? "none" : isLoaded ? "bounce1 1.5s ease-in-out infinite" : "none",
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
                  animation: isDropping ? "none" : isLoaded ? "bounce2 1.3s ease-in-out infinite" : "none",
                }}
                className="scale-[125%]"
              />
            </div>
            <div
              className="w-[30%] mt-[20%] h-full flex items-center justify-center flex-col"
              onClick={!showGif ? handleGiftClick : undefined}
            >
              <div className="flex flex-col justify-center items-center relative">
                {!showGif && (
                  <>
                    <img src="/gift/open-gift/received.svg" alt="" className="absolute -top-[30%] scale-[200%] z-10" />
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
                      className="cursor-pointer scale-[150%] relative z-10"
                      draggable="false"
                    />
                  </>
                )}
                {showGif && (
                  <div>
                    <img
                      src="/gift/open-gift/gift-open-gif.gif"
                      alt="Gift opening"
                      className="relative scale-[130%] z-[50] pointer-events-none"
                      draggable="false"
                    />
                    {showLight && (
                      <div className="absolute top-[20%] left-[-30%] transform -translate-y-1/2 z-[30] opacity-60 animate-light-height">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="534"
                          height="461"
                          viewBox="0 0 534 461"
                          fill="none"
                          className="relative z-[40] opacity-80"
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
                      <div className="absolute top-[30%] text-white left-[-25%] transform -translate-y-1/2 z-[40] animate-no-opacity-lightHeight">
                        <div className="text-white opacity-100 relative z-[50] text-[40px] text-center mb-5 w-[500px] font-bold">
                          YOU HAVE RECEIVED
                        </div>
                        <div
                          style={{
                            textShadow:
                              "-3px -3px 0 #ffc629, -3px 0 0 #ffc629, -3px 3px 0 #ffc629, 0 -3px 0 #ffc629, 0 3px 0 #ffc629, 3px -3px 0 #ffc629, 3px 0 0 #ffc629, 3px 3px 0 #ffc629, -2px -2px 0 #ffc629, -2px 0 0 #ffc629, -2px 2px 0 #ffc629, 0 -2px 0 #ffc629, 0 2px 0 #ffc629, 2px -2px 0 #ffc629, 2px 0 0 #ffc629, 2px 2px 0 #ffc629, -1px -1px 0 #ffc629, -1px 0 0 #ffc629, -1px 1px 0 #ffc629, 0 -1px 0 #ffc629, 0 1px 0 #ffc629, 1px -1px 0 #ffc629, 1px 0 0 #ffc629, 1px 1px 0 #ffc629",
                          }}
                          className="absolute gift-text translate-x-[-15%] font-complain text-center mb-5 w-[700px] font-bold"
                        >
                          {formatNumberWithCommas(giftDetail?.assets[0].amount)} {giftDetail?.assets[0].metadata.symbol}
                        </div>
                        <div className="absolute ml-[39%] mt-[17%] w-[100px]">
                          <ActionButton
                            text="Go Back"
                            type="neutral"
                            className="w-[100px] h-[30px] text-lg"
                            onClick={() => {
                              router.push("/");
                            }}
                          />
                        </div>
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
                  animation: isDropping ? "none" : isLoaded ? "bounce4 1.4s ease-in-out infinite" : "none",
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
                  animation: isDropping ? "none" : isLoaded ? "bounce5 1.6s ease-in-out infinite" : "none",
                }}
                className="scale-[125%]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/gift/open-gift/consumed-gift-text.svg" alt="" className="scale-100" aria-hidden="true" />
          <ActionButton
            text="Go Back"
            type="neutral"
            className="text-2xl font-bold"
            onClick={() => {
              router.push("/");
            }}
          />
          <div className="relative ">
            <img
              src="/gift/open-gift/consumed-gift-light-cone.svg"
              alt=""
              className="scale-100 absolute top-[-40%] blur-xl pointer-events-none"
              aria-hidden="true"
            />
            <img src="/gift/open-gift/consumed-gift.svg" alt="" className="scale-100" aria-hidden="true" />
          </div>
        </div>
      )}

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
        .animate-drop-left,
        .animate-drop-top,
        .animate-drop-right,
        .animate-drop-bottom {
          animation: dropDown 0.5s ease-in forwards;
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
        @keyframes no-opacity-lightHeight {
          0% {
            height: 0;
            opacity: 0;
          }
          100% {
            height: 361px;
            opacity: 0.9;
          }
        }
        .animate-light-height {
          animation: lightHeight 2s ease-out forwards;
        }
        .animate-no-opacity-lightHeight {
          animation: no-opacity-lightHeight 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OpenGiftContainer;
