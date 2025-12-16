import PayrollDetail from "@/components/Payroll/PayrollDetail";
import React, { Suspense } from "react";

const PayrollDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading payroll details...</span>
        </div>
      }
    >
      <PayrollDetail />
    </Suspense>
  );
};

export default PayrollDetailPage;
