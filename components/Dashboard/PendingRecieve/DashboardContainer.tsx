"use client";
import * as React from "react";
import { RequestLinkSection } from "./RequestLinkSection";
import { PendingRequestSection } from "./PendingRequestSection";
import { RequestHistoryTable } from "./RequestHistoryTable";

export const DashboardContainer: React.FC = () => {
  return (
    <main className="flex flex-col gap-4 items-center self-stretch px-4 py-5 mx-auto max-w-none rounded-2xl bg-neutral-900 flex-[1_0_0] max-md:gap-3 max-md:px-3 max-md:py-4 max-md:max-w-[991px] max-sm:gap-2 max-sm:px-2 max-sm:py-3 max-sm:max-w-screen-sm">
      <RequestLinkSection />
      <PendingRequestSection />

      {/* Request history */}
      <section className="flex flex-col gap-2.5 items-start self-stretch">
        <header className="flex flex-col gap-2 justify-center items-start w-[1076px] max-md:w-full">
          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
            Accepted request history
          </h2>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
            This is a list of requests you have accepted.
          </p>
        </header>
        <RequestHistoryTable />
      </section>
    </main>
  );
};

export default DashboardContainer;
