import React, { useCallback, useMemo, useState } from "react";
import { CellContent, Table } from "@/components/Common/Table";
import { ActionButton } from "@/components/Common/ActionButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { RequestPayment, RequestPaymentStatus } from "@/types/request-payment";
import { formatDate } from "@/services/utils/formatDate";
import { useDenyRequest } from "@/services/api/request-payment";
import { useGetAddressBooks } from "@/services/api/address-book";
import { Empty } from "@/components/Common/Empty";

interface PendingRequestSectionProps {
  pendingRequests?: RequestPayment[];
}

const HEADERS = ["Amount", "Message", "Request From", "Date/Time"];
const COLUMN_WIDTHS = { "0": "10%", "1": "35%", "2": "10%", "3": "10%", "4": "15%" } as const;
const DEFAULT_TOKEN_SYMBOL = "QASH";
const ADDRESS_TRUNCATE_LENGTH = { start: 6, end: 4 } as const;

// Helper function to truncate address
const truncateAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, ADDRESS_TRUNCATE_LENGTH.start)}...${address.slice(-ADDRESS_TRUNCATE_LENGTH.end)}`;
};

// Helper function to get token symbol
const getTokenSymbol = (request: RequestPayment): string => {
  const token = Array.isArray(request.tokens) ? request.tokens[0] : request.tokens;
  return token?.metadata?.symbol || DEFAULT_TOKEN_SYMBOL;
};

// Dedicated row actions component to safely use hooks
const PendingRequestActions: React.FC<{
  request: RequestPayment;
  recipientName?: string;
  onDeny: (id: number) => void;
}> = ({ request, recipientName, onDeny }) => {
  const { openModal } = useModal();
  const [isConfirming, setIsConfirming] = useState(false);

  const token = Array.isArray(request.tokens) ? request.tokens[0] : request.tokens;

  const handleAccept = () => {
    // openModal<SendModalProps>(MODAL_IDS.SEND, {
    //   pendingRequestId: request.id,
    //   recipient: request.payee,
    //   recipientName,
    //   amount: request.amount,
    //   message: request.message,
    //   tokenAddress: token?.faucetId,
    //   isGroupPayment: request.isGroupPayment,
    //   isRequestPayment: true,
    //   onTransactionConfirmed: async () => {
    //     setIsConfirming(true);
    //   },
    // });
  };

  return (
    <div className="flex gap-1 items-center justify-center">
      {!isConfirming ? (
        <>
          <ActionButton text="Deny" type="deny" className="flex-1" onClick={() => onDeny(request.id)} />
          <ActionButton text="Accept" className="flex-1" onClick={handleAccept} />
        </>
      ) : (
        <ActionButton text="..." loading className="flex-1 h-8" />
      )}
    </div>
  );
};

export const PendingRequestSection: React.FC<PendingRequestSectionProps> = ({ pendingRequests = [] }) => {
  const { mutate: denyRequest } = useDenyRequest();
  const { data: addressBooks } = useGetAddressBooks();

  // Memoized URL parameters
  const urlParams = useMemo(() => {
    if (typeof window === "undefined") return {};

    const urlSearchParams = new URLSearchParams(window.location.search);
    return {
      isGroupPayment: urlSearchParams.get("isGroupPayment"),
      groupPaymentId: urlSearchParams.get("groupPaymentId"),
    };
  }, []); // Empty dependency array since URL doesn't change during component lifecycle

  // Memoized address book lookup map for better performance
  const addressBookMap = useMemo(() => {
    if (!addressBooks) return new Map<string, string>();

    const map = new Map<string, string>();
    addressBooks.forEach((category: any) => {
      category.addressBooks?.forEach((book: any) => {
        map.set(book.address, book.name);
      });
    });
    return map;
  }, [addressBooks]);

  // Check if current row should have pulse animation
  const shouldPulse = useCallback(
    (request: RequestPayment) => {
      return (
        pendingRequests.length > 0 &&
        urlParams.isGroupPayment === "true" &&
        urlParams.groupPaymentId &&
        String(request.groupPaymentId) === urlParams.groupPaymentId
      );
    },
    [urlParams.isGroupPayment, urlParams.groupPaymentId, pendingRequests.length],
  );

  const findRecipientName = useCallback(
    (address: string): string | undefined => addressBookMap.get(address),
    [addressBookMap],
  );

  const actionRenderer = useCallback(
    (rowData: Record<string, CellContent>, index: number) => {
      const request = pendingRequests[index];
      if (request?.status !== RequestPaymentStatus.PENDING) return null;

      const recipientName = findRecipientName(request.payee);

      return <PendingRequestActions request={request} recipientName={recipientName} onDeny={id => denyRequest(id)} />;
    },
    [pendingRequests, findRecipientName, denyRequest],
  );

  // Memoized data transformation for better performance
  const data = useMemo(
    () =>
      pendingRequests.map(request => {
        const symbol = getTokenSymbol(request);
        const formattedDate = formatDate(new Date(request.createdAt));
        const truncatedPayee = truncateAddress(request.payee);

        return {
          Amount: (
            <div className="flex gap-1 items-center">
              <img src={`/token/${symbol.toLowerCase()}.svg`} alt={symbol.toLowerCase()} className="w-4 h-4" />
              <span className="text-base tracking-tight leading-5 text-center text-white max-sm:text-sm">
                {request.amount}
              </span>
            </div>
          ),
          Message: <div className="flex gap-1 items-center w-full justify-center text-white">{request.message}</div>,
          "Request From": (
            <div className="bg-[#363636] bg-opacity-10 rounded-full w-fit px-2 mx-auto flex items-center justify-center gap-2 py-1">
              {request.isGroupPayment && (
                <img src="/sidebar/group-payment.gif" alt="Group" className="w-4 h-4 grayscale" />
              )}
              <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">
                {truncatedPayee}
              </span>
            </div>
          ),
          "Date/Time": (
            <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{formattedDate}</span>
          ),
          status: request.status,
        };
      }),
    [pendingRequests],
  );

  // Custom row class function for pulse animation
  const getRowClassName = useCallback(
    (rowData: Record<string, CellContent>, index: number): string => {
      const originalRequest = pendingRequests[index];
      return originalRequest && shouldPulse(originalRequest) ? "animate-pulse-hover" : "";
    },
    [pendingRequests, shouldPulse],
  );

  if (data.length === 0) {
    return (
      <>
        <header className="flex flex-col gap-2 justify-center items-start w-full">
          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
            Pending payment request
          </h2>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
            Once you accept, you're committing to send the amount to the request address
          </p>
        </header>
        <Empty title="No pending requests" />
      </>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-2 justify-center items-start w-full">
        <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
          Pending payment request
        </h2>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
          Once you accept, you're committing to send the amount to the request address
        </p>
      </header>
      <div className="max-h-[230px] overflow-y-auto">
        <Table
          headers={HEADERS}
          data={data}
          actionColumn={true}
          actionRenderer={actionRenderer}
          columnWidths={COLUMN_WIDTHS}
          rowClassName={getRowClassName}
        />
      </div>
    </>
  );
};
