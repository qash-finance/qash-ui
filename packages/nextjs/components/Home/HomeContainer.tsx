"use client";
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { CardContainer } from "./CardContainer";
import { PaymentInteraction } from "./PaymentInteraction";
import { Overview } from "./Overview";
import { TransactionHistory } from "./TransactionHistory";

export const HomeContainer = () => {
  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-4 px-5">
        <Header />
        <CardContainer />
      </div>
      <Overview />
    </div>
  );
};
