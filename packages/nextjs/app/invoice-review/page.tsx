import { InvoiceReviewContainer } from "@/components/InvoiceReview/InvoiceReviewContainer";
import React, { Suspense } from "react";

export default function InvoiceReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading invoice...</span>
        </div>
      }
    >
      <InvoiceReviewContainer />
    </Suspense>
  );
}
