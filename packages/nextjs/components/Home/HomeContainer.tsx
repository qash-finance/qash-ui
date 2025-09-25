"use client";
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { CardContainer } from "./CardContainer";
import { PaymentInteraction } from "./PaymentInteraction";

export const HomeContainer = () => {
  return (
    <div className="w-full h-full p-5 flex flex-col items-start">
      <div className="w-full h-full flex flex-col gap-4 px-5">
        <Header />
        <CardContainer />
        <PaymentInteraction />
      </div>
    </div>
  );
};
