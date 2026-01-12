import { ClientInvoiceReviewContainer } from "@/components/InvoiceReview/ClientInvoiceReviewContainer";
import React, { Suspense } from "react";

export default function ClientInvoiceReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading invoice...</span>
        </div>
      }
    >
      <ClientInvoiceReviewContainer />
    </Suspense>
  );
}
