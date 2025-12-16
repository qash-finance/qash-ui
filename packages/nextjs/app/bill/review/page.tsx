import BillReviewContainer from "@/components/Bill/BillReviewContainer";
import React, { Suspense } from "react";

const BillReviewPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading review...</span>
        </div>
      }
    >
      <BillReviewContainer />
    </Suspense>
  );
};

export default BillReviewPage;
