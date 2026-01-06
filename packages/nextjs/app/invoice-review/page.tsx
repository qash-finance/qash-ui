import { EmployeeInvoiceReviewContainer } from "@/components/InvoiceReview/EmployeeInvoiceReviewContainer";
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
      <EmployeeInvoiceReviewContainer />
    </Suspense>
  );
}
