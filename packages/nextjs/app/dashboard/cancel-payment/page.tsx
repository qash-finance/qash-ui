import CancelDashboardContainer from "@/components/Dashboard/CancelTransaction/CancelDashboardContainer";
import { Suspense } from "react";

export default function CancelPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelDashboardContainer />
    </Suspense>
  );
}
