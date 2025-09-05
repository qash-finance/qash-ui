import React, { Suspense } from "react";
import ClaimEmailContainer from "@/components/Claim/ClaimEmailContainer";

const ClaimPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimEmailContainer />
    </Suspense>
  );
};

export default ClaimPage;
