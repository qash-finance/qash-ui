"use client";
import React from "react";

const formatCompact = (value: number | string) => {
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(num)) return String(value);
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });
  return formatter.format(num);
};

const TokenBadge = ({ token, amount }: { token: string; amount: string | number }) => {
  const displayAmount = formatCompact(amount);

  return (
    <div className="px-3 py-1 bg-app-background rounded-full flex flex-row gap-1 items-center flex-none w-fit">
      <img src="/token/qash.svg" alt="token icon" className="w-5 flex-shrink-0" />
      <span className="leading-none font-medium truncate">{displayAmount}</span>
      <span className="leading-none">{token}</span>
    </div>
  );
};

const TreasuryCard = ({ text, subtitle, icon }: { text: string; subtitle: string; icon: string }) => {
  return (
    <div
      className="w-full min-w-[327px] h-[180px] bg-background rounded-[12px] flex flex-col gap-1 border border-primary-divider p-3 justify-between"
      style={{
        backgroundImage: `url(/card/background.svg)`,
        backgroundSize: "contain",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col gap-1">
        <img src={icon} alt="background" className="w-10 h-10" />
        <span className="text-text-secondary text-sm">{text}</span>
        <span className="text-text-primary text-3xl font-bold">{subtitle}</span>
      </div>

      <div className="flex flex-row gap-2 w-full overflow-x-auto ">
        <TokenBadge token="QASH" amount="12,340.00" />
        <TokenBadge token="USD" amount="3,207.00" />
        <TokenBadge token="USD" amount="20000000" />
        <TokenBadge token="USD" amount="3,207.00" />
        <TokenBadge token="USD" amount="3,207.00" />
      </div>
    </div>
  );
};

const UpcomingPayrollCard = ({ text, subtitle, icon }: { text: string; subtitle: string; icon: string }) => {
  return (
    <div
      className="w-full min-w-[327px] h-[180px] bg-background rounded-[12px] flex flex-col gap-1 border border-primary-divider p-3 justify-between"
      style={{
        backgroundImage: `url(/card/background.svg)`,
        backgroundSize: "contain",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col gap-1">
        <img src={icon} alt="background" className="w-10 h-10" />
        <span className="text-text-secondary text-sm">{text}</span>
        <span className="text-text-primary text-3xl font-bold">{subtitle}</span>
      </div>

      <div className="flex flex-row gap-2 w-full  ">
        <div className="px-3 py-1 bg-app-background rounded-full flex flex-row gap-1 items-center flex-none w-fit">
          <img src="/card/calendar-icon-light.svg" alt="token icon" className="w-4" />
          <span className="leading-none font-medium text-sm text-text-secondary">Due on</span>
          <span className="leading-none">Dec 1st, 2025</span>
        </div>

        <div className="px-3 py-1 bg-app-background rounded-full flex flex-row gap-1 items-center flex-none w-fit">
          {/* <img src="/token/qash.svg" alt="token icon" className="w-5 flex-shrink-0" /> */}
          <span className="leading-none">15 Payees</span>
        </div>
      </div>
    </div>
  );
};

export const CardContainer = () => {
  return (
    <div className="w-full flex flex-row gap-2">
      <TreasuryCard text="Total Treasury Balance" subtitle="$15,547,938" icon="/card/treasury-icon.svg" />
      <UpcomingPayrollCard text="Upcoming Payroll" subtitle="$42,500" icon="/card/calendar-icon.svg" />
    </div>
  );
};
