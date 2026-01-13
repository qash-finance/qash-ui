import React, { useState } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import GeneralStatistics from "./Overview/GeneralStatistics";
import TopInteractedAddresses from "./Overview/TopInteractedAddresses";
import SpendingAverageChart from "./Overview/SpendingAverageChart";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import TransactionHistory from "./Overview/TransactionHistory";

const BalanceOverviewHeader = () => {
  // Generate the last 12 months of data (11 months before current month + current month)
  const generateChartData = () => {
    const currentDate = new Date();
    const data = [];
    const currentBalance = 5254217052;

    // Start from 11 months ago
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      // Generate balance values that vary and trend toward the current balance
      // Start lower and gradually increase with some variation
      const progress = (11 - i) / 11; // 0 to 1
      const baseBalance = 2500000000 + progress * (currentBalance - 2500000000);
      const variation = Math.sin(i * 0.5) * 400000000; // Add wave variation
      const balance = Math.max(2000000000, Math.floor(baseBalance + variation));

      data.push({
        month: month,
        year: year,
        monthYear: `${month} ${year}`,
        balance: balance,
      });
    }

    // Update the current month's balance to match the header
    if (data.length > 0) {
      data[data.length - 1].balance = currentBalance;
    }

    return data;
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className=" rounded-lg p-3 border border-primary-divider backdrop-blur-sm">
          <div className="text-text-primary text-sm font-semibold">${(payload[0].value / 1000000).toFixed(0)}M</div>
          <div className="text-text-secondary text-xs">{payload[0].payload.monthYear}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-5 bg-background rounded-2xl border border-primary-divider flex flex-row ">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">Total Balance</p>
          <div className="flex items-start gap-1">
            <span className="text-2xl font-semibold text-text-primary">$</span>
            <span className="text-4xl font-medium text-text-primary tracking-tight">5,254,217,052</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-500">+$126.40</span>
            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full border border-green-300">
              1.25%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <img src="/misc/earn-icon.svg" alt="Earn Icon" className="w-5" />
            <span className="text-sm text-text-secondary">Earn Balance</span>
            <span className="text-sm font-medium text-blue-500">APY: 6%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-semibold text-text-primary">$</span>
            <span className="text-2xl font-medium text-text-primary tracking-tight leading-none">14,217,052</span>
          </div>
          <p className="text-sm font-semibold text-green-500 leading-none">+$750.20</p>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-black text-white font-semibold rounded-xl border border-primary-divider transition-colors">
            Deposit
          </button>
          <button className="px-6 py-2.5 bg-primary-blue text-white font-semibold rounded-xl border border-[#B4D3FF] transition-colors">
            Earn
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* Mini Chart */}
        <ResponsiveContainer width="100%" height="100%" className="rounded-xl">
          <LineChart data={chartData} className="!outline-none p-2">
            <XAxis
              dataKey="monthYear"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickMargin={0}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#066eff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#066eff", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const Overview = () => {
  const [timePeriod, setTimePeriod] = useState<"month" | "year">("month");

  return (
    <div className="w-full">
      <BaseContainer
        header={
          <div className="flex flex-col w-full p-5 gap-4">
            <span className="text-text-primary text-2xl leading-none text-left w-full">Overview</span>
            <BalanceOverviewHeader />
          </div>
        }
        childrenClassName="px-3 py-5"
      >
        <div className="flex flex-row h-full items-start w-full border border-primary-divider rounded-3xl">
          <TransactionHistory />
          {/* <GeneralStatistics timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
          <TopInteractedAddresses />
          <SpendingAverageChart /> */}
        </div>
      </BaseContainer>
    </div>
  );
};
