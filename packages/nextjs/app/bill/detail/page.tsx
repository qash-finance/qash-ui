import BillDetailContainer from "@/components/Bill/BillDetailContainer";
import React, { Suspense } from "react";

const BillDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading bill...</span>
        </div>
      }
    >
      <BillDetailContainer />
    </Suspense>
  );
};

export default BillDetailPage;
