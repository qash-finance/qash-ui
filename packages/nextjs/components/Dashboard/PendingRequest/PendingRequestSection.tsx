import React, { useCallback } from "react";
import { CellContent, Table } from "@/components/Common/Table";
import { ActionButton } from "@/components/Common/ActionButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, SendModalProps } from "@/types/modal";
import { RequestPayment } from "@/types/request-payment";
import { formatDate } from "@/services/utils/formatDate";
import { useDenyRequest } from "@/services/api/request-payment";
import { useGetAddressBooks } from "@/services/api/address-book";

interface PendingRequestSectionProps {
  pendingRequests?: RequestPayment[];
}

const headers = ["Amount", "Message", "Request From", "Date/Time"];

export const PendingRequestSection: React.FC<PendingRequestSectionProps> = ({ pendingRequests = [] }) => {
  const { openModal } = useModal();
  const { mutate: denyRequest } = useDenyRequest();
  const { data: addressBooks } = useGetAddressBooks();

  const findRecipientName = useCallback(
    (address: string) => {
      if (!addressBooks) return undefined;

      for (const category of addressBooks) {
        const addressBook = category.addressBooks?.find(book => book.address === address);
        if (addressBook) return addressBook.name;
      }
      return undefined;
    },
    [addressBooks],
  );

  const actionRenderer = useCallback(
    (rowData: Record<string, CellContent>, index: number) => {
      // Access the original request data through the index
      const request = pendingRequests[index];
      const recipientName = findRecipientName(request.payee);
      const status = request?.status;

      return (
        <div className="flex gap-1 items-center justify-center">
          {status === "pending" && (
            <>
              <ActionButton text="Deny" type="deny" className="flex-1" onClick={() => denyRequest(request.id)} />
              <ActionButton
                text="Accept"
                className="flex-1"
                onClick={() =>
                  openModal<SendModalProps>(MODAL_IDS.SEND, {
                    pendingRequestId: request.id,
                    recipient: request.payee,
                    recipientName: recipientName,
                    amount: request.amount,
                    message: request.message,
                    tokenAddress: request.tokens[0].faucetId,
                  })
                }
              />
            </>
          )}
        </div>
      );
    },
    [pendingRequests, openModal, findRecipientName],
  );

  const data = pendingRequests.map(request => {
    // Get the first token for display (assuming single token for now)
    const token = request.tokens && Array.isArray(request.tokens) ? request.tokens[0] : request.tokens;
    const symbol = token?.metadata?.symbol || "QASH";
    const amount = request.amount;

    // Format the date
    const formattedDate = formatDate(new Date(request.createdAt));

    // Truncate the payer address for display
    const truncatedPayee =
      request.payee.length > 10 ? `${request.payee.slice(0, 6)}...${request.payee.slice(-4)}` : request.payee;

    return {
      Amount: (
        <div className="flex gap-1 items-center">
          <img src={`/token/${symbol.toLowerCase()}.svg`} alt={symbol.toLowerCase()} className="w-4 h-4" />
          <span className="text-base tracking-tight leading-5 text-center text-white max-sm:text-sm">{amount}</span>
        </div>
      ),
      Message: <div className="flex gap-1 items-center w-full justify-center text-white">{request.message}</div>,
      "Request From": (
        <div className="bg-[#363636] bg-opacity-10 rounded-full w-fit px-2 mx-auto flex items-center justify-center">
          <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">{truncatedPayee}</span>
        </div>
      ),
      "Date/Time": (
        <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{formattedDate}</span>
      ),
      status: request.status,
    };
  });

  return (
    <React.Fragment>
      <header className="flex flex-col gap-2 justify-center items-start w-full">
        <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
          Pending payment request
        </h2>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
          Once you accept, you're committing to send the amount to the request address
        </p>
      </header>
      {data.length > 0 ? (
        <Table
          headers={headers}
          data={data}
          actionColumn={true}
          actionRenderer={actionRenderer}
          columnWidths={{ "0": "10%", "1": "35%", "2": "10%", "3": "10%", "4": "15%" }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 bg-[#1E1E1E] rounded-lg">
          <p className="text-stone-300 text-sm">No pending requests</p>
        </div>
      )}
    </React.Fragment>
  );
};
