"use client";
import EditPaymentLinkContainer from "@/components/PaymentLink/EditPaymentLinkContainer";
import React, { Suspense } from "react";

const EditPaymentLinkPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPaymentLinkContainer />
    </Suspense>
  );
};

export default EditPaymentLinkPage;
