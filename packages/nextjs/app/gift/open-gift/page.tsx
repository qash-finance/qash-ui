"use client";
import React, { Suspense } from "react";
import OpenGiftContainer from "@/components/Gift/OpenGiftContainer";

const OpenGiftPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OpenGiftContainer />
    </Suspense>
  );
};

export default OpenGiftPage;
