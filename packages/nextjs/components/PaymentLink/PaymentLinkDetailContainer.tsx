import React, { useState, useMemo, useEffect } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { Table } from "../Common/Table";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetPaymentLinkByCodeForOwner } from "@/services/api/payment-link";
import { PaymentLinkStatus } from "@/types/payment-link";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Badge, BadgeStatus } from "../Common/Badge";
import { formatAddress } from "@/services/utils/miden/address";
import { ViewOnExplorerTooltip } from "./ViewOnExplorerTooltip";
import { Tooltip } from "react-tooltip";
import { useTitle } from "@/contexts/TitleProvider";

const Card = ({ title, text }: { title: string; text: React.ReactNode }) => {
  return (
    <div
      className="relative w-full h-full rounded-xl border border-primary-divider p-5 flex flex-col overflow-hidden gap-3"
      style={{
        backgroundImage: `url(/card/background.svg)`,
        backgroundSize: "30%",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    >
      <span className="text-text-secondary text-sm leading-none">{title}</span>
      {text}
    </div>
  );
};

const PaymentLinkDetailContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentLinkCode = searchParams.get("code");
  const { data: paymentLink, isLoading, error } = useGetPaymentLinkByCodeForOwner(paymentLinkCode || "");
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();

  // Set breadcrumb title when payment link data is loaded
  useEffect(() => {
    if (paymentLink) {
      setTitle(
        <div className="flex items-center gap-2">
          <span
            className="text-text-secondary hover:text-text-primary cursor-pointer"
            onClick={() => router.push("/payment-link")}
          >
            Payment Links
          </span>
          <span className="text-text-secondary">/</span>
          <span className="text-text-primary">{paymentLink.title}</span>
        </div>,
      );
      setShowBackArrow(true);
      // Wrap in another function to prevent React from calling it as a state updater
      setOnBackClick(() => () => router.push("/payment-link"));
    }
  }, [paymentLink, setTitle, setShowBackArrow, setOnBackClick, router]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any tooltip trigger or tooltip content
      if (!target.closest("[data-tooltip-id]") && !target.closest(".tooltip-content")) {
        setActiveTooltipId(null);
      }
    };

    if (activeTooltipId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltipId]);

  const handleCopyLink = () => {
    if (!paymentLink) return;

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${paymentLink.code}`;
    navigator.clipboard.writeText(url);
    toast.success("Payment link copied to clipboard");
  };

  // Format payment data for table display
  const tableData = useMemo(() => {
    if (!paymentLink?.records) return [];

    return paymentLink.records.map(record => ({
      "header-0": (
        <div className="flex justify-center items-center">
          <span className="text-text-primary">
            {new Date(record.createdAt).toLocaleString("sv-SE", { hour12: false })}
          </span>
        </div>
      ),
      Amount: (
        <div className="flex justify-center items-center gap-1">
          <span className="text-text-primary leading-none">{paymentLink.amount}</span>
          {paymentLink.acceptedTokens?.[0] && (
            <img
              src={
                paymentLink.acceptedTokens[0].symbol === "QASH"
                  ? "/token/qash.svg"
                  : blo(turnBechToHex(paymentLink.acceptedTokens[0].address))
              }
              alt={paymentLink.acceptedTokens[0].symbol}
              className="w-4 h-4"
            />
          )}
        </div>
      ),
      Status: (
        <div className="flex justify-center items-center">
          <Badge
            status={record.txid ? BadgeStatus.SUCCESS : BadgeStatus.NEUTRAL}
            text={record.txid ? "Succeed" : "Pending"}
            className="!py-1.5 w-fit px-5"
          />
        </div>
      ),
      From: (
        <div className="flex items-center gap-2 justify-center">
          <span className="text-text-primary">{formatAddress(record.payer)}</span>
          <img
            src="/misc/copy-icon.svg"
            alt="copy"
            className="w-4 h-4 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(record.payer || "");
              toast.success("Copied to clipboard");
            }}
          />
        </div>
      ),
      "Transaction Hash": record.txid ? (
        <div className="flex items-center gap-2 justify-center">
          <span className="text-text-primary">
            {record.txid.slice(0, 8)}...{record.txid.slice(-8)}
          </span>
          <img
            src="/misc/copy-icon.svg"
            alt="copy"
            className="w-4 h-4 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(record.txid || "");
              toast.success("Copied to clipboard");
            }}
          />
        </div>
      ) : (
        <span className="text-text-secondary text-sm">-</span>
      ),
      " ": (
        <div className="flex justify-center items-center">
          <div
            data-tooltip-id={`payment-explorer-${record.id}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              setActiveTooltipId(
                activeTooltipId === `payment-explorer-${record.id}` ? null : `payment-explorer-${record.id}`,
              );
            }}
          >
            <img src="/misc/three-dot-icon.svg" alt="More" className="w-6 h-6" />
          </div>
        </div>
      ),
    }));
  }, [paymentLink]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full p-4 items-center justify-center gap-4">
        <img src="/loading-square.gif" alt="Loading" className="w-8 h-8" />
        <p className="text-text-secondary">Loading payment link...</p>
      </div>
    );
  }

  // Show error state
  if (error || !paymentLink || !paymentLinkCode) {
    return (
      <div className="flex flex-col w-full h-full p-4 items-center justify-center gap-4">
        <img src="/misc/red-circle-warning.svg" alt="Error" className="w-8 h-8" />
        <p className="text-text-secondary">Failed to load payment link</p>
        <button
          onClick={() => router.push("/payment-link")}
          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:opacity-80"
        >
          Back to Payment Links
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-full p-4 items-center justify-start gap-5">
      {/* Header */}
      <div className="w-full flex flex-row items-center justify-between px-7 mb-2">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-2xl font-bold leading-none">{paymentLink.title}</h1>
          <h1 className="text-sm text-text-secondary leading-none">{paymentLink.description}</h1>
        </div>
        <div className="flex gap-2 w-[250px]">
          <SecondaryButton
            text="Edit link"
            icon="/misc/edit-icon.svg"
            iconPosition="left"
            onClick={() => router.push(`/payment-link/edit?code=${paymentLink.code}`)}
            variant="light"
            buttonClassName="flex-1"
          />
          <PrimaryButton
            text="Copy link"
            icon="/misc/thin-copy-icon.svg"
            iconPosition="left"
            onClick={handleCopyLink}
            containerClassName="flex-1"
          />
        </div>
      </div>
      <div className="w-full flex flex-row gap-2 px-7">
        <Card
          title="Link"
          text={
            <span className="text-text-primary underline truncate w-full">
              {process.env.NEXT_PUBLIC_APP_URL}/payment/{paymentLink.code}
            </span>
          }
        />
        <Card
          title="Total Collected"
          text={
            <div className="flex flex-row gap-1 items-center">
              {paymentLink.acceptedTokens?.[0] && (
                <img
                  src={
                    paymentLink.acceptedTokens[0].symbol === "QASH"
                      ? "/token/qash.svg"
                      : blo(turnBechToHex(paymentLink.acceptedTokens[0].address))
                  }
                  alt={paymentLink.acceptedTokens[0].symbol}
                  className="w-5 h-5"
                />
              )}
              <span className="text-text-primary font-semibold">
                {paymentLink.records?.length
                  ? (paymentLink.records.length * parseFloat(paymentLink.amount || "0")).toFixed(2)
                  : "0"}
              </span>
            </div>
          }
        />
        <Card
          title="Status"
          text={
            <Badge
              status={paymentLink.status === PaymentLinkStatus.ACTIVE ? BadgeStatus.SUCCESS : BadgeStatus.NEUTRAL}
              text={paymentLink.status}
              className="w-fit px-3"
            />
          }
        />
        <Card
          title="Created on"
          text={
            <span className="text-text-primary leading-none">{new Date(paymentLink.createdAt).toLocaleString()}</span>
          }
        />
      </div>

      <div className="w-full flex flex-col gap-5 h-full bg-app-background rounded-3xl p-5">
        <div className="flex flex-col gap-3">
          <span className="text-xl font-semibold text-text-primary leading-none">
            {paymentLink.records?.length || 0} Payments Collected
          </span>
          <span className="text-sm text-text-secondary leading-none">See who’s sent you money through your links.</span>
        </div>

        <Table
          headers={[
            <div className="flex justify-center items-center">
              <span className="text-text-primary">Timestamp</span>
            </div>,
            "Amount",
            "Status",
            "From",
            "Transaction Hash",
            " ",
          ]}
          data={tableData}
        />
      </div>

      {/* Payment Explorer Tooltips */}
      {paymentLink.records?.map((record: any) => (
        <Tooltip
          key={`payment-explorer-${record.id}`}
          id={`payment-explorer-${record.id}`}
          clickable
          style={{
            zIndex: 30,
            borderRadius: "16px",
            padding: "0",
          }}
          place="left"
          openOnClick
          noArrow
          border="none"
          opacity={1}
          isOpen={activeTooltipId === `payment-explorer-${record.id}`}
          afterHide={() => setActiveTooltipId(null)}
          render={() => (
            <div className="tooltip-content">
              <ViewOnExplorerTooltip link={record} />
            </div>
          )}
        />
      ))}
    </div>
  );
};

export default PaymentLinkDetailContainer;
