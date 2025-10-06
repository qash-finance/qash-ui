"use client";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useGiftDetail } from "@/hooks/server/useGiftDetail";
import useOpenGift from "@/hooks/server/useOpenGift";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { MIDEN_EXPLORER_URL, QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatAddress } from "@/services/utils/miden/address";
import { consumeUnauthenticatedGiftNote, createGiftNote, stringToSecretArray } from "@/services/utils/miden/note";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { Gift } from "@/types/gift";
import { MODAL_IDS } from "@/types/modal";
import { NoteStatus } from "@/types/note";
import { blo } from "blo";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatUnits } from "viem";

const generateRandomColor = () => {
  const colors = ["#E9358F", "#3FDEC9", "#335CFF", "#FF9A68", "#7D52F4", "#FFD268"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const InfinityBannerContainer = () => {
  const bannerItems = Array.from({ length: 40 }, (_, index) => (
    <React.Fragment key={index}>
      <span className="text-xl font-bold text-[#71ACFF] uppercase whitespace-nowrap anton-regular mx-2">
        Share gifts, spread joy
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
    <div className="w-full bg-background py-2.5 overflow-hidden">
      <div className="flex items-center gap-1 animate-scroll">{bannerItems}</div>
    </div>
  );
};

const NoWalletContainer = () => {
  return (
    <div className="w-full h-full relative">
      <img
        src="/gift/otter-3.svg"
        alt="otter-3"
        className="w-[170px] absolute -top-15 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div className="bg-[#FF68B3] w-[220px] p-1 z-1 relative">
        <div className="border border-black p-2 flex items-center justify-center gap-2">
          <img src="/gift/open-gift/question-box.gif" alt="question-box" className="w-5" />
          <span className="leading-none text-white">
            No Wallet?{" "}
            <span className="underline cursor-pointer" onClick={() => window.open("https://miden.fi", "_blank")}>
              Get it here!
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

const OpenGiftContent = ({
  onOpen,
  isOpening,
  isCompleted,
}: {
  onOpen: () => void;
  isOpening: boolean;
  isCompleted: boolean;
}) => {
  const [progress, setProgress] = useState(0);

  const handleClick = () => {
    if (!isOpening && !isCompleted) {
      onOpen();
    }
  };

  useEffect(() => {
    if (isOpening && progress < 98) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 2, 98));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpening, progress]);

  useEffect(() => {
    if (isCompleted && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => prev + 2);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, progress]);

  const circumference = 2 * Math.PI * 100; // radius of 100px for the circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-fit h-fit relative flex justify-center items-center flex-col">
      <span className="text-text-primary text-7xl font-bold anton-regular leading-none uppercase">
        You just received a gift!
      </span>
      <img
        src="/gift/open-gift/draw-pink-circle.svg"
        alt="draw-pink-circle"
        className="w-[270px] absolute -top-8 -right-11"
      />

      <span className="text-text-primary text-xl font-bold mt-8">Click here</span>
      <img src="/gift/open-gift/double-arrow-down.gif" alt="gift-arrow-down" className="w-20" />
      <img src="/gift/generate-box-gift.svg" alt="gift-box" className="w-[300px] cursor-pointer" />

      <div className="absolute bottom-25 right-35">
        <div
          className="w-[200px] h-[200px] rounded-full flex items-center justify-center p-3 cursor-pointer relative bg-[#3FDEC9]"
          onClick={handleClick}
        >
          {/* Progress circle */}
          {(isOpening || isCompleted) && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 z-10" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="87"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-75 ease-linear"
              />
            </svg>
          )}

          <div
            className="border-3 border-black p-2 flex items-center justify-center rounded-full w-full h-full relative z-0 transition-all"
            style={{
              borderColor: isOpening || isCompleted ? "#1DAF9C" : "black",
            }}
          >
            <span
              className="text-center nanum-pen-script-regular font-bold text-5xl tracking-tighter"
              style={{
                color: "text-text-primary",
                textAlign: "center",
                textShadow: "0 2px 0 rgba(0, 0, 0, 0.51)",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "#FFF",
                fontStyle: "normal",
                lineHeight: "60%",
                fontSize: isOpening || isCompleted ? "36px" : "44px",
              }}
            >
              {isOpening || isCompleted ? (progress >= 100 ? "Done" : "Validating") : "Click to open"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsumedGiftContent = () => {
  const router = useRouter();

  return (
    <div className="w-fit h-fit relative flex justify-center items-center flex-col gap-4">
      <span className="text-text-primary text-7xl font-bold anton-regular leading-none uppercase">
        The gift was already opened
      </span>
      <img
        src="/gift/open-gift/draw-blue-circle.svg"
        alt="draw-pink-circle"
        className="w-[270px] absolute -top-8 -right-11"
      />

      <div className="bg-[#00E09D] rounded-2xl flex p-1 ">
        <div
          className="border border-black rounded-xl py-1 px-10 flex flex-row gap-2 items-center w-full justify-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          Go Back
        </div>
      </div>

      <img src="/gift/open-gift/consumed-gift-box.svg" alt="gift-box" className="w-[300px] cursor-pointer" />
    </div>
  );
};

const ReceivedGiftContainer = ({ gift }: { gift: Gift }) => {
  const router = useRouter();

  return (
    <div className="w-full h-full relative bg-[#066EFF] rounded-t-4xl animate-slide-up">
      <img src="/gift/open-gift/wiggle-2.svg" alt="wiggle-2" className="w-[426px] absolute top-0 left-10 " />
      <img src="/gift/open-gift/wiggle-1.svg" alt="wiggle-1" className="w-full h-[650px] absolute bottom-5" />

      <div className="w-full h-full relative flex justify-center items-center flex-col p-5 gap-3">
        {/* close button */}
        <div className="absolute top-5 right-5">
          <div className="bg-white rounded-full flex p-1 cursor-pointer" onClick={() => router.push("/")}>
            <div className="border border-black rounded-full px-2 py-1">
              <span className="text-black text-2xl font-bold nanum-pen-script-regular leading-none">close</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <span className="text-white text-6xl font-bold anton-regular leading-none uppercase">Congrats</span>

        {/* Gift */}
        <div className="bg-white rounded-4xl p-5 flex flex-col justify-center items-center gap-10 w-[520px]">
          <img src="/gift/open-gift/qash-coin.svg" alt="qash-coin" className="w-[292px] h-[150px]" />

          <div className="flex flex-col gap-2">
            <span className="text-black text-2xl leading-none font-bold">YOU HAVE RECEIVED</span>
            <div className="bg-[#FF9A68] rounded-full flex p-1">
              <div className="border border-black rounded-full px-2 py-1 flex flex-row gap-2 items-center w-full justify-center nanum-pen-script-regular text-2xl">
                From <img src={blo(turnBechToHex(gift.sender))} className="w-4 h-4 rounded-full" />{" "}
                {formatAddress(gift.sender)}
              </div>
            </div>
            {gift && (
              <div className="flex flex-row gap-2 items-center w-full justify-center">
                <img
                  src={
                    gift?.assets[0]?.faucetId === QASH_TOKEN_ADDRESS
                      ? "/token/qash.svg"
                      : blo(turnBechToHex(gift.assets[0]?.faucetId))
                  }
                  className="w-[64px] h-[64px] rounded-full mt-1"
                />
                <span className="text-black text-[80px] font-bold leading-none uppercase antons-regular truncate">
                  {formatNumberWithCommas(gift.assets[0]?.amount)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-[#00E09D] rounded-2xl flex p-1 ">
            <div
              className="border border-black rounded-xl py-1 px-10 flex flex-row gap-2 items-center w-full justify-center cursor-pointer"
              onClick={() => router.push("/")}
            >
              Go Back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // **************** State *******************
  const [isOpening, setIsOpening] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReceivedGift, setShowReceivedGift] = useState(false);

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

    setIsOpening(true);

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

      // Mark as completed
      setIsOpening(false);
      setIsCompleted(true);
    } catch (error) {
      console.error(error);
      setIsOpening(false);
      setIsCompleted(false);

      // Close validating modal on error
      closeModal(MODAL_IDS.VALIDATING);

      // Show fail modal
      openModal(MODAL_IDS.FAIL, {
        tryAgain: handleGiftClick,
      });
      toast.error("Failed to open gift");
    }
  };

  // Show ReceivedGiftContainer 2 seconds after completion
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        setShowReceivedGift(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  return (
    <div className="flex flex-col gap-4 items-start h-full w-full overflow-hidden">
      <div className="w-full flex items-center gap-2 font-semibold px-8 py-4">
        <img src="/gift/gift-icon.svg" alt="gift-box" className="w-6 h-6" />
        <span className="text-text-primary text-2xl font-semibold">Open Gift</span>
      </div>

      <div
        className="w-full h-full relative flex justify-start items-center flex-col pt-5 gap-5"
        style={{
          background:
            giftDetail?.status === NoteStatus.CONSUMED
              ? "linear-gradient(180deg, #D7D7D7 0%, #FFF 60.33%)"
              : "linear-gradient(180deg, #DDECFF 0%, #FFF 60.33%)",
        }}
      >
        <InfinityBannerContainer />

        {!showReceivedGift && (
          <>
            <div className="w-full h-full relative flex justify-center items-center flex-col z-2">
              {giftDetail?.status === NoteStatus.PENDING ? (
                <OpenGiftContent onOpen={handleGiftClick} isOpening={isOpening} isCompleted={isCompleted} />
              ) : (
                <ConsumedGiftContent />
              )}
            </div>

            <img
              src="/gift/background-qash-text.svg"
              alt="background-qash-text"
              className="w-[1050px] absolute top-90 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            />

            <div className="absolute bottom-15 right-15">
              <NoWalletContainer />
            </div>
          </>
        )}

        {showReceivedGift && giftDetail && <ReceivedGiftContainer gift={giftDetail} />}
      </div>
    </div>
  );
};

export default OpenGiftContainer;
