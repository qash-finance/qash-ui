import React from "react";
import { Table } from "@/components/Common/Table";
import { RequestPayment, RequestPaymentStatus } from "@/types/request-payment";
import { formatDate } from "@/services/utils/formatDate";
import { StatusBadge } from "@/components/Common/StatusBadge";
import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";
import { Empty } from "@/components/Common/Empty";

interface AcceptedRequestSectionProps {
  acceptedRequests?: RequestPayment[];
}

const headers = ["Amount", "Message", "Request From", "Date/Time", "Status", ""];

export const AcceptedRequestSection: React.FC<AcceptedRequestSectionProps> = ({ acceptedRequests = [] }) => {
  const data = acceptedRequests.map(request => {
    // Get the first token for display (assuming single token for now)
    const token = request.tokens && Array.isArray(request.tokens) ? request.tokens[0] : request.tokens;
    const symbol = token?.metadata?.symbol || "QASH";
    const amount = request.amount;

    // Format the date
    const formattedDate = formatDate(new Date(request.createdAt));

    // Truncate the payer address for display
    const truncatedPayee =
      request.payee.length > 10 ? `${request.payee.slice(0, 6)}...${request.payee.slice(-4)}` : request.payee;

    const statusText = request.status === RequestPaymentStatus.ACCEPTED ? "Succeed" : "Failed";

    return {
      Amount: (
        <div className="flex gap-1 items-center">
          <img src={`/token/${symbol.toLowerCase()}.svg`} alt={symbol.toLowerCase()} className="w-4 h-4" />
          <span className="text-base tracking-tight leading-5 text-center text-white max-sm:text-sm">{amount}</span>
        </div>
      ),
      Message: <div className="flex gap-1 items-center w-full justify-center text-white">{request.message}</div>,
      "Request From": (
        <div className="bg-[#363636] bg-opacity-10 rounded-full w-fit px-2 mx-auto flex items-center justify-center gap-2 py-1">
          {request.isGroupPayment && <img src="/sidebar/group-payment.gif" alt="Group" className="w-4 h-4 grayscale" />}
          <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">{truncatedPayee}</span>
        </div>
      ),
      "Date/Time": (
        <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{formattedDate}</span>
      ),
      Status: (
        <div className="flex gap-1 items-center justify-center">
          <StatusBadge status={request.status} text={statusText} />
        </div>
      ),
      "": (
        <div
          className="flex gap-1 items-center justify-center cursor-pointer"
          onClick={() => {
            window.open(`${MIDEN_EXPLORER_URL}/tx/${request.txid}`, "_blank");
          }}
        >
          <img src="/external-link-icon.svg" alt="link" className="w-4 h-4" />
        </div>
      ),
    };
  });

  if (data.length === 0) {
    return (
      <>
        <header className="flex flex-col gap-2 justify-center items-start w-full">
          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
            Accepted payment request
          </h2>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
            This is a list of requests you have accepted.
          </p>
        </header>
        <Empty title="No accepted requests" />
      </>
    );
  }

  return (
    <React.Fragment>
      <header className="flex flex-col gap-2 justify-center items-start w-full">
        <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
          Accepted payment request
        </h2>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
          This is a list of requests you have accepted.
        </p>
      </header>
      <Table
        headers={headers}
        data={data}
        columnWidths={{ "0": "10%", "1": "35%", "2": "10%", "3": "10%", "4": "5%", "5": "5%" }}
      />
    </React.Fragment>
  );
};
