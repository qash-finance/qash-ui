"use client";
import * as React from "react";
import { StatusCard } from "./StatusCard";
import { DataTable } from "./DataTable";

export const RecallDashboardContainer: React.FC = () => {
  const pendingRecallData = [
    {
      type: "P2ID-R",
      hasGift: true,
      amount: "120,000",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      actionDisabled: false,
    },
    {
      type: "P2ID-R",
      amount: "1.02",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      actionDisabled: false,
    },
    {
      type: "P2ID-R",
      amount: "260.01",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      actionDisabled: false,
    },
    {
      type: "P2ID-R",
      amount: "100.05",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      actionDisabled: false,
    },
  ];

  const waitingRecallData = [
    {
      type: "P2ID-R",
      amount: "120,000",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      recallIn: "01H:19M:16S",
      actionDisabled: true,
    },
    {
      type: "P2ID-R",
      amount: "1.02",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      recallIn: "02H:59M:45S",
      actionDisabled: true,
    },
    {
      type: "P2ID-R",
      amount: "260.01",
      from: "0xd...s78",
      dateTime: "25/11/2024, 07:15",
      recallIn: "03H:01M:07S",
      actionDisabled: true,
    },
  ];

  return (
    <section className="rounded-2xl bg-neutral-900 w-full h-full px-[16px] py-[20px]">
      <div className="flex-1 w-full max-md:max-w-full">
        <article className="overflow-hidden flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60"></article>
        <div className="flex flex-wrap gap-2 p-1.5 w-full rounded-2xl bg-neutral-950 min-h-[164px] max-md:max-w-full">
          <article className=" flex-1 text-white rounded-xl bg-[#1E1E1E] ">
            <div
              className=" relative flex-1 shrink rounded-2xl basis-0 bg-[#1150AE] min-w-60 border-white border-solid shadow-md border-[3px] mt-5 h-[87%]"
              style={{
                backgroundImage: `
                  linear-gradient(to bottom, rgba(30,160,220,0.7), rgba(17,80,174,0.1)),
                  url('/recall-background.svg')
                `,
                backgroundSize: "cover, cover",
                backgroundPosition: "center, center",
              }}
            >
              <div className="flex-col rounded-[10px] flex justify-center items-center h-[105px] ">
                <div className="relative top-[-10px] z-0">
                  <img src="/recall-header.svg" alt="recall-background" className="w-full h-full" />
                </div>
                <div className="relative top-[-65px] z-10">
                  <span className="text-white text-lg font-normal font-['Barlow']">Next recall</span>
                </div>
                <div className="font-bold text-4xl text-white relative top-[-25px] z-10">01H:19M:16S</div>
              </div>
            </div>
          </article>

          <StatusCard title="Waiting for recall" value="07" hasBackground={true} />

          <StatusCard title="Recalled" value="15" hasBackground={true} />
        </div>

        <DataTable title="Pending to recall" subtitle="..." data={pendingRecallData} />

        <DataTable title="Waiting for recall" subtitle="..." showRecallColumn={true} data={waitingRecallData} />
      </div>
    </section>
  );
};

export default RecallDashboardContainer;
