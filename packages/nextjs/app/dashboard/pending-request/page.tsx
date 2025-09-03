import DashboardContainer from "@/components/Dashboard/PendingRequest/DashboardContainer";
import { Suspense } from "react";

export default function PendingRequestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContainer />
    </Suspense>
  );
}
