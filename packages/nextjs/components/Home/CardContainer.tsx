"use client";
import React from "react";

const Card = ({ text, subtitle, icon }: { text: string; subtitle: string; icon: string }) => {
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
        <span className="text-text-primary text-base font-bold">{text}</span>
        <span className="text-text-secondary text-sm">{subtitle}</span>
      </div>
      <div
        className={`p-[0.5px] rounded-[10px] justify-center items-center w-[90px]`}
        style={{
          boxShadow: "0 3px 8px -2px rgba(0, 0, 0, 0.30), 0 1px 0 0 rgba(255, 255, 255, 0.70) inset, 0 0 0 1px #E6E6E6",
        }}
      >
        <button
          className={`cursor-pointer w-full flex gap-2 items-center justify-center bg-card-button-background rounded-[10px] py-1.5 border-t-2 border-t-card-button-border-top`}
          onClick={() => {}}
        >
          <span className="text-card-button-text text-[14px] font-bold">Create</span>
        </button>
      </div>
    </div>
  );
};

export const CardContainer = () => {
  return (
    <div className="w-full flex flex-row gap-2">
      <Card text="Create payroll" subtitle="Run private payroll that stays compliant" icon="/card/star-icon.svg" />
      <Card text="Create automation" subtitle="Automate your received money movement" icon="/card/code-icon.svg" />
      <Card
        text="Create multisig"
        subtitle="Secure your fund by creating a multi-owner account"
        icon="/card/pen-icon.svg"
      />
    </div>
  );
};
