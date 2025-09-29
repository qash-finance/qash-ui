import React, { useState } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import GeneralStatistics from "./Overview/GeneralStatistics";
import TopInteractedAddresses from "./Overview/TopInteractedAddresses";
import SpendingAverageChart from "./Overview/SpendingAverageChart";

export const Overview = () => {
  const [timePeriod, setTimePeriod] = useState<"month" | "year">("month");

  return (
    <div className="w-full">
      <BaseContainer
        header={<span className="text-text-primary text-xl leading-none text-left w-full px-5">Overview</span>}
        childrenClassName="px-3 py-5"
      >
        <div className="flex flex-row h-full items-start w-full border border-primary-divider rounded-3xl">
          <GeneralStatistics timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
          <TopInteractedAddresses />
          <SpendingAverageChart />
        </div>
      </BaseContainer>
    </div>
  );
};
