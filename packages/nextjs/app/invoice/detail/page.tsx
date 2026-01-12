import ClientInvoiceDetailContainer from "@/components/Invoice/ClientInvoiceDetailContainer";
import React, { Suspense } from "react";

const ClientInvoiceDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary">Loading client invoice...</span>
        </div>
      }
    >
      <ClientInvoiceDetailContainer />
    </Suspense>
  );
};

export default ClientInvoiceDetailPage;
