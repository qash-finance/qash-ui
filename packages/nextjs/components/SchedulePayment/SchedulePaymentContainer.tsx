"use client";

import React, { useState, useEffect } from "react";
import { SchedulePaymentItem } from "./SchedulePaymentItem";
import StatusCircle from "./StatusCircle";

const UpcomingPaymentHeader = () => {
  return (
    <div className="flex flex-col justify-center items-center flex-1 h-fit">
      <article
        className="relative flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60 w-full"
        style={{
          backgroundImage: "url('/schedule-payment/upcoming-payment-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "0px -10px",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex text-lg font-normal font-['Barlow'] rounded-tl-xl w-[45%] justify-center items-center"
          style={{
            backgroundImage: "url('/schedule-payment/header-container.svg')",
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-black font-normal">Next upcoming payment</span>
        </div>
        <div
          className="rounded-[10px] flex justify-center items-center h-[90px] m-2 bg-black"
          style={{
            backgroundImage: "url('/schedule-payment/header-inner-background.svg')",
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Scheduled Payment Card */}
          <div className="flex items-center justify-between overflow-hidden px-4 rounded-[10px] h-full w-full relative">
            {/* Recipient Section */}
            <div className="flex items-center gap-3 z-10">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-center bg-cover"
                style={{
                  backgroundImage: `url('/gift/flower.png')`,
                  backgroundColor: "#06ffb4",
                }}
              />

              {/* Recipient Info */}
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-['Barlow'] text-[#989898] leading-5">Recipient</span>
                <span className="font-['Barlow'] font-medium text-white leading-5">0x23C...11g63</span>
              </div>
            </div>

            {/* Amount and Date Section */}
            <div className="flex flex-col gap-2 items-end z-10">
              {/* Amount */}
              <div className="flex items-center gap-2">
                <img alt="QASH" className="w-5 h-5" src="/token/qash.svg" />
                <span className="font-repetition-scrolling text-white text-2xl tracking-[2.16px]">5,045.09</span>
              </div>

              {/* Date Badge */}
              <div className="bg-[#06ffb4] flex items-center px-3 py-0.5 rounded shadow-[1px_1px_0px_0px_#ffffff]">
                <span className="font-['Barlow'] font-medium text-[#292929] text-xs leading-[18px]">
                  01/08/2025, 09:41
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

const LockedAmountHeader = () => {
  return (
    <div className="flex flex-col justify-center items-center flex-1 h-fit">
      <article
        className="relative flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60 w-full"
        style={{
          backgroundImage: "url('/schedule-payment/locked-amount-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "0px -10px",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex text-Grey-50 text-lg font-normal font-['Barlow'] rounded-tl-xl w-[40%] justify-center items-center h-fit"
          style={{
            backgroundImage: "url('/schedule-payment/header-container.svg')",
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-black text-lg font-normal">Locked Amount</span>
        </div>
        <div
          className="rounded-[10px]  flex justify-center items-center h-[90px] m-2 bg-black"
          style={{
            backgroundImage: "url('/schedule-payment/header-inner-background.svg')",
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="font-repetition-scrolling text-white text-4xl tracking-[2.16px]">$345,045.09</span>
        </div>
      </article>
    </div>
  );
};

export const SchedulePaymentContainer = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Demo: Simulate loading progress
  const startDemo = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 2; // Increase by 2% every 100ms
      });
    }, 100);
  };

  return (
    <div className="flex flex-col justify-start gap-2 p-2 w-full h-full overflow-hidden overflow-y-auto">
      <div className="flex flex-row gap-2">
        <UpcomingPaymentHeader />
        <LockedAmountHeader />
      </div>

      <SchedulePaymentItem
        recipient={{
          address: "0x23C...11g63",
          avatar: "/gift/flower.png",
          name: "Recipient",
        }}
        totalAmount="100"
        claimedAmount="50"
        currency="QASH"
        progress={50}
        transactions={[
          {
            id: "1",
            date: "01/07/2025 09:41",
            status: "completed",
            label: "Create",
            progress: 100,
          },
          {
            id: "2",
            date: "01/08/2025 09:41",
            status: "completed",
            label: "First txn",
            progress: 100,
          },
          {
            id: "3",
            date: "01/09/2025 09:41",
            status: "current",
            label: "Txn 02",
            progress: 60,
          },
          {
            id: "4",
            date: "01/10/2025 09:41",
            status: "pending",
            label: "Txn 03",
            progress: 0,
          },
          {
            id: "5",
            date: "01/11/2025 09:41",
            status: "pending",
            label: "Txn 04",
            progress: 0,
          },
          {
            id: "6",
            date: "01/12/2025 09:41",
            status: "pending",
            label: "Txn 05",
            progress: 0,
          },
          {
            id: "7",
            date: "01/13/2025 09:41",
            status: "pending",
            label: "Txn 06",
            progress: 0,
          },
          {
            id: "8",
            date: "01/14/2025 09:41",
            status: "pending",
            label: "Txn 07",
            progress: 0,
          },
        ]}
      />
      <SchedulePaymentItem
        recipient={{
          address: "0x23C...11g63",
          avatar: "/gift/flower.png",
          name: "Recipient",
        }}
        totalAmount="100"
        claimedAmount="50"
        currency="QASH"
        progress={50}
        transactions={[
          {
            id: "1",
            date: "01/07/2025 09:41",
            status: "completed",
            label: "Create",
            progress: 100,
          },
          {
            id: "2",
            date: "01/08/2025 09:41",
            status: "completed",
            label: "First txn",
            progress: 100,
          },
          {
            id: "3",
            date: "01/09/2025 09:41",
            status: "current",
            label: "Txn 02",
            progress: 60,
          },
          {
            id: "4",
            date: "01/10/2025 09:41",
            status: "pending",
            label: "Txn 03",
            progress: 0,
          },
          {
            id: "5",
            date: "01/11/2025 09:41",
            status: "pending",
            label: "Txn 04",
            progress: 0,
          },
          {
            id: "6",
            date: "01/12/2025 09:41",
            status: "pending",
            label: "Txn 05",
            progress: 0,
          },
          {
            id: "7",
            date: "01/13/2025 09:41",
            status: "pending",
            label: "Txn 06",
            progress: 0,
          },
          {
            id: "8",
            date: "01/14/2025 09:41",
            status: "pending",
            label: "Txn 07",
            progress: 0,
          },
        ]}
      />
      <SchedulePaymentItem
        recipient={{
          address: "0x23C...11g63",
          avatar: "/gift/flower.png",
          name: "Recipient",
        }}
        totalAmount="100"
        claimedAmount="50"
        currency="QASH"
        progress={50}
        transactions={[
          {
            id: "1",
            date: "01/07/2025 09:41",
            status: "completed",
            label: "Create",
            progress: 100,
          },
          {
            id: "2",
            date: "01/08/2025 09:41",
            status: "completed",
            label: "First txn",
            progress: 100,
          },
          {
            id: "3",
            date: "01/09/2025 09:41",
            status: "current",
            label: "Txn 02",
            progress: 60,
          },
          {
            id: "4",
            date: "01/10/2025 09:41",
            status: "pending",
            label: "Txn 03",
            progress: 0,
          },
          {
            id: "5",
            date: "01/11/2025 09:41",
            status: "pending",
            label: "Txn 04",
            progress: 0,
          },
          {
            id: "6",
            date: "01/12/2025 09:41",
            status: "pending",
            label: "Txn 05",
            progress: 0,
          },
          {
            id: "7",
            date: "01/13/2025 09:41",
            status: "pending",
            label: "Txn 06",
            progress: 0,
          },
          {
            id: "8",
            date: "01/14/2025 09:41",
            status: "pending",
            label: "Txn 07",
            progress: 0,
          },
        ]}
      />
      <SchedulePaymentItem
        recipient={{
          address: "0x23C...11g63",
          avatar: "/gift/flower.png",
          name: "Recipient",
        }}
        totalAmount="100"
        claimedAmount="50"
        currency="QASH"
        progress={50}
        transactions={[
          {
            id: "1",
            date: "01/07/2025 09:41",
            status: "completed",
            label: "Create",
            progress: 100,
          },
          {
            id: "2",
            date: "01/08/2025 09:41",
            status: "completed",
            label: "First txn",
            progress: 100,
          },
          {
            id: "3",
            date: "01/09/2025 09:41",
            status: "current",
            label: "Txn 02",
            progress: 60,
          },
          {
            id: "4",
            date: "01/10/2025 09:41",
            status: "pending",
            label: "Txn 03",
            progress: 0,
          },
          {
            id: "5",
            date: "01/11/2025 09:41",
            status: "pending",
            label: "Txn 04",
            progress: 0,
          },
          {
            id: "6",
            date: "01/12/2025 09:41",
            status: "pending",
            label: "Txn 05",
            progress: 0,
          },
          {
            id: "7",
            date: "01/13/2025 09:41",
            status: "pending",
            label: "Txn 06",
            progress: 0,
          },
          {
            id: "8",
            date: "01/14/2025 09:41",
            status: "pending",
            label: "Txn 07",
            progress: 0,
          },
        ]}
      />

      {/* Demo Loading Circle with controls */}
      {/* <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
        <StatusCircle progress={progress} />
        <div className="flex flex-col gap-2">
          <span className="text-white text-sm">Progress: {progress}%</span>
          <button
            onClick={startDemo}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Start Demo"}
          </button>
        </div>
      </div> */}
    </div>
  );
};
