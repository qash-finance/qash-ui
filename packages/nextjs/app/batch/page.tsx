"use client";

import BatchTransactionContainer from "@/components/Batch/BatchTransactionContainer";
import React from "react";

export default function BatchPage() {
  const handleConfirm = () => {
    console.log("Confirm");
  };

  return <BatchTransactionContainer onConfirm={handleConfirm} />;
}
