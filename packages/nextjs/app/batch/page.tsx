"use client";

import BatchTransactionContainer from "@/components/Batch/BatchTransactionContainer";
import React, { Suspense } from "react";

export default function BatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BatchTransactionContainer />
    </Suspense>
  );
}
