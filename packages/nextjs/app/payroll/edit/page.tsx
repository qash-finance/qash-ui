import EditPayroll from "@/components/Payroll/EditPayroll";
import React, { Suspense } from "react";

export default function EditPayrollPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading payroll...</span>
        </div>
      }
    >
      <EditPayroll />
    </Suspense>
  );
}
