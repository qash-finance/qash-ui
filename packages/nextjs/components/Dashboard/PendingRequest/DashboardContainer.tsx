"use client";
import React, { useEffect } from "react";
import { RequestLinkSection } from "./RequestLinkSection";
import { PendingRequestSection } from "./PendingRequestSection";
import { useGetRequests } from "@/services/api/request-payment";
import { AcceptedRequestSection } from "./AcceptedRequestSection";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useSearchParams } from "next/navigation";
import { MODAL_IDS } from "@/types/modal";

export const DashboardContainer: React.FC = () => {
  const { data: requests } = useGetRequests();
  const { openModal } = useModal();
  const searchParams = useSearchParams();
  const recipient = searchParams.get("recipient");

  // Extract pending requests from the response
  const pendingRequests = requests?.pending || [];
  const acceptedRequests = requests?.accepted || [];

  useEffect(() => {
    if (recipient) {
      openModal(MODAL_IDS.NEW_REQUEST, { recipient });
    }
  }, [recipient]);

  return (
    <main className="flex flex-col gap-4 rounded-2xl bg-neutral-900 w-full h-full px-4 py-5">
      <RequestLinkSection />
      <PendingRequestSection pendingRequests={pendingRequests} />
      <AcceptedRequestSection acceptedRequests={acceptedRequests} />
    </main>
  );
};

export default DashboardContainer;
