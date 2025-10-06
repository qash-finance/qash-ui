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
import { NoteStatus } from "@/types/note";

const OpenGiftContainer = () => {
  // **************** Pathname Hooks *******************
  const searchParams = useSearchParams();
  const encodedCode = searchParams.get("code");
  const code = encodedCode ? decodeURIComponent(encodedCode) : "";

  // **************** Custom Hooks *******************
  const { walletAddress, isConnected } = useWalletConnect();
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
    if (giftDetail.status === NoteStatus.CONSUMED) {
      toast.error("This gift has already been opened");
      return;
    }

    if (giftDetail.status === NoteStatus.RECALLED) {
      toast.error("This gift has been recalled by the sender");
      return;
    }

    // Show validating modal
    openModal(MODAL_IDS.VALIDATING);

    try {
      // decode secret number back to array of 4 numbers
      const secret = stringToSecretArray(giftDetail?.secretHash!);
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
  // if (isLoadingGiftDetail || !isLoaded) {
  //   return <></>;
  // }

  return (
    <div
      className="flex w-full h-full justify-center items-center flex-col max-h-screen overflow-y-hidden relative transition-colors duration-700 ease-in-out"
      style={{
        backgroundColor: giftDetail?.status === NoteStatus.CONSUMED || showGif ? "#000000" : "transparent",
        borderRadius: giftDetail?.status === NoteStatus.CONSUMED ? "10px" : "",
      }}
    >
      {giftDetail?.status === NoteStatus.PENDING ? (
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
                    <div className="relative top-[70px] scale-170">
                      <img
                        src="/gift/open-gift/gift-open-gif.gif"
                        alt="Gift opening"
                        className="block pointer-events-none"
                        draggable="false"
                      />
                      <img
                        src="/gift/open-gift/light-particle.gif"
                        alt=""
                        className="absolute top-[120px] inset-0 pointer-events-none mix-blend-color-dodge"
                        aria-hidden="true"
                      />
                    </div>

                    {showLight && (
                      <div className="absolute top-[150px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white z-[40] animate-no-opacity-lightHeight flex flex-col items-center justify-center">
                        <img src="/gift/open-gift/congrats-text.svg" alt="" className="scale-150" />
                        <div className="text-white text-[50px] text-center w-[500px] font-bold">YOU HAVE RECEIVED</div>
                        <div
                          style={{
                            textShadow:
                              "-3px -3px 0 #ffc629, -3px 0 0 #ffc629, -3px 3px 0 #ffc629, 0 -3px 0 #ffc629, 0 3px 0 #ffc629, 3px -3px 0 #ffc629, 3px 0 0 #ffc629, 3px 3px 0 #ffc629, -2px -2px 0 #ffc629, -2px 0 0 #ffc629, -2px 2px 0 #ffc629, 0 -2px 0 #ffc629, 0 2px 0 #ffc629, 2px -2px 0 #ffc629, 2px 0 0 #ffc629, 2px 2px 0 #ffc629, -1px -1px 0 #ffc629, -1px 0 0 #ffc629, -1px 1px 0 #ffc629, 0 -1px 0 #ffc629, 0 1px 0 #ffc629, 1px -1px 0 #ffc629, 1px 0 0 #ffc629, 1px 1px 0 #ffc629",
                          }}
                          className="gift-text font-complain text-center mb-5 w-[700px] font-bold"
                        >
                          {formatNumberWithCommas(giftDetail?.assets[0].amount)} {giftDetail?.assets[0].metadata.symbol}
                        </div>
                        <ActionButton
                          text="Go Back"
                          type="neutral"
                          className="w-[100px] h-[40px] text-xl"
                          onClick={() => {
                            router.push("/");
                          }}
                        />
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
      ) : giftDetail?.status === NoteStatus.CONSUMED ? (
        <div className="flex flex-col items-center justify-center gap-8">
          <img src="/gift/open-gift/consumed-gift-text.svg" alt="" className="scale-110" aria-hidden="true" />
          <ActionButton
            text="Go Back"
            type="neutral"
            className="text-xl font-bold"
            onClick={() => {
              router.push("/");
            }}
          />
          <div className="relative top-[10%]">
            <img
              src="/gift/open-gift/consumed-gift.svg"
              alt=""
              className="scale-125"
              aria-hidden="true"
              draggable="false"
            />

            <img
              src="/gift/open-gift/gift-box-lit.svg"
              alt=""
              className="scale-125 absolute top-0 left-12 pointer-events-none"
              aria-hidden="true"
              draggable="false"
            />
            <img
              src="/gift/open-gift/consumed-gift-light-cone.svg"
              alt=""
              className="scale-125 absolute top-[-40%] blur-xl pointer-events-none"
              aria-hidden="true"
              draggable="false"
            />
            <img
              src="/gift/open-gift/light-particle.gif"
              alt=""
              draggable="false"
              className="scale-125 absolute top-[-30%]  pointer-events-none mix-blend-color-dodge"
              aria-hidden="true"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-8">
          <img
            src="/gift/open-gift/gift-cancelled-text.svg"
            alt=""
            className="scale-110"
            aria-hidden="true"
            draggable="false"
          />
          <ActionButton
            text="Go Back"
            type="neutral"
            className="text-xl font-bold"
            onClick={() => {
              router.push("/");
            }}
          />
          <div className="relative top-[10%]">
            <img
              src="/gift/open-gift/consumed-gift.svg"
              alt=""
              className="scale-125"
              aria-hidden="true"
              draggable="false"
            />

            <img
              src="/gift/open-gift/gift-box-lit.svg"
              alt=""
              className="scale-125 absolute top-0 left-12 pointer-events-none"
              aria-hidden="true"
              draggable="false"
            />
            <img
              src="/gift/open-gift/consumed-gift-light-cone.svg"
              alt=""
              draggable="false"
              className="scale-125 absolute top-[-40%] blur-xl pointer-events-none"
              aria-hidden="true"
            />
            <img
              src="/gift/open-gift/light-particle.gif"
              alt=""
              draggable="false"
              className="scale-125 absolute top-[-30%]  pointer-events-none mix-blend-color-dodge"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-15 right-15 pointer-events-auto">
        <div
          className="flex items-center justify-center w-[200px] h-[29px]"
          aria-hidden="false"
          style={{
            background: "url('/gift/open-gift/no-wallet-container.svg') no-repeat center center",
            backgroundSize: "110% 110%",
          }}
        >
          <div className="flex flex-row items-center gap-1 w-[200px] text-center justify-center">
            <img src="/gift/open-gift/question-box.gif" alt="Help" className="w-5 h-6 shrink-0" draggable={false} />
            <p className="text-[#3d3d3d] text-[13px] leading-none tracking-[-0.084px]">
              <span>No Wallet?</span>
              <button
                type="button"
                onClick={() => openModal(MODAL_IDS.CONNECT_WALLET)}
                className="underline text-[#066eff] pl-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#066eff] rounded cursor-pointer"
              >
                Get it here!
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* If wallet not connected, blur only this container's context */}
      {!isConnected && (
        <>
          <div className="absolute inset-0 pointer-events-auto bg-black/30 backdrop-blur-md rounded-[inherit]" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  pointer-events-auto text-white text-center flex flex-col items-center justify-center gap-4">
            <img
              src="/gift/gift-icon.svg"
              className="scale-150 filter invert brightness-0 saturate-0"
              aria-hidden="true"
            />
            <span className="text-white text-center text-4xl w-150">
              You’ll need to connect your wallet to open this gift.
            </span>
            <ActionButton text="Connect Wallet" onClick={() => openModal(MODAL_IDS.CONNECT_WALLET)} />
          </div>
        </>
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
