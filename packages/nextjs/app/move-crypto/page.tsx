"use client";

import MoveCryptoContainer from "@/components/MoveCrypto/MoveCryptoContainer";
import { Suspense } from "react";

const MoveCryptoPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MoveCryptoContainer />
    </Suspense>
  );
};

export default MoveCryptoPage;
