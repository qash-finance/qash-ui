"use client";
import React from "react";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import SchedulePaymentCard from "@/components/SchedulePayment/SchedulePaymentCard";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import {
  MODAL_IDS,
  RecurringTransferItem,
  RecurringTransferModalProps,
  RecurringTransferTransaction,
} from "@/types/modal";
import { useRouter } from "next/navigation";
import { useGetSchedulePayments } from "@/services/api/schedule-payment";
import { useAccountContext } from "@/contexts/AccountProvider";
import { SchedulePaymentStatus } from "@/types/schedule-payment";
import { formatAddress } from "@/services/utils/miden/address";
import { useGetAddressBooks } from "@/services/api/address-book";

const qashToken: AssetWithMetadata = {
  amount: "0",
  faucetId: QASH_TOKEN_ADDRESS,
  metadata: { symbol: QASH_TOKEN_SYMBOL, decimals: QASH_TOKEN_DECIMALS, maxSupply: QASH_TOKEN_MAX_SUPPLY },
};

const EmptySchedulePayments = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-[270px]">
      <img src="/modal/finder-question-mark.svg" alt="no schedule payments" className="w-12 h-12" />
      <span className="text-[#989898] text-[16px] tracking-[-0.32px]">Recurring transfer list is empty</span>
    </div>
  );
};

export function RecurringTransferModal({ isOpen, onClose, zIndex }: ModalProp<RecurringTransferModalProps>) {
  // const { data: addressBook } = useGetAddressBooks();
  // const { accountId } = useAccountContext();
  // const { data: schedulePayments } = useGetSchedulePayments({
  //   payer: accountId,
  //   status: SchedulePaymentStatus.ACTIVE,
  // }) as { data: any[] | undefined };
  // const { openModal } = useModal();
  // const router = useRouter();
  // const items: RecurringTransferItem[] = (schedulePayments || []).slice(-3).map(payment => {
  //   const payeeName = addressBook
  //     ?.flatMap(category => category.addressBooks || [])
  //     .find(item => item?.address === payment.payee)?.name;
  //   let frequencyLabel = "";
  //   switch (payment.frequency) {
  //     case "DAILY":
  //       frequencyLabel = "Daily";
  //       break;
  //     case "WEEKLY":
  //       frequencyLabel = "Weekly";
  //       break;
  //     case "MONTHLY":
  //       frequencyLabel = "Monthly";
  //       break;
  //     default:
  //       frequencyLabel = "Custom";
  //       break;
  //   }
  //   return {
  //     recipientName: payeeName ? `(${payeeName}) ${formatAddress(payment.payee)}` : formatAddress(payment.payee),
  //     amount: payment.amount,
  //     token: {
  //       faucetId: payment.tokens[0]?.faucetId || "",
  //       amount: payment.amount,
  //       metadata: {
  //         symbol: payment.tokens[0]?.metadata?.symbol || "QASH",
  //         decimals: payment.tokens[0]?.metadata?.decimals || 8,
  //         maxSupply: payment.tokens[0]?.metadata?.maxSupply || 0,
  //       },
  //     },
  //     frequencyLabel,
  //     startDateLabel: `From ${new Date(payment.createdAt).toLocaleDateString("en-GB")}`,
  //     timesLabel: `${payment.executionCount}/${payment.maxExecutions} times`,
  //   };
  // });
  // const transactionsMap: Record<number, RecurringTransferTransaction[]> = {};
  // (schedulePayments || []).forEach((payment, index) => {
  //   if (payment.transactions && payment.transactions.length > 0) {
  //     // Use existing transactions if available
  //     transactionsMap[index] = payment.transactions.map((tx: any) => ({
  //       amountLabel: `${tx.assets[0]?.amount} ${tx.assets[0]?.metadata?.symbol || "QASH"}`,
  //       claimableAfterLabel: `Claimable after ${new Date(tx.createdAt).toLocaleDateString("en-GB")}`,
  //     }));
  //   } else {
  //     // Generate transactions based on schedule payment data
  //     const startDate = new Date(payment.createdAt);
  //     const maxExecutions = payment.maxExecutions || 3;
  //     const frequency = payment.frequency;
  //     transactionsMap[index] = Array.from({ length: maxExecutions }, (_, txIndex) => {
  //       const transactionDate = new Date(startDate);
  //       // Calculate the date for this transaction based on frequency
  //       switch (frequency) {
  //         case "DAILY":
  //           transactionDate.setDate(transactionDate.getDate() + txIndex);
  //           break;
  //         case "WEEKLY":
  //           transactionDate.setDate(transactionDate.getDate() + txIndex * 7);
  //           break;
  //         case "MONTHLY":
  //           transactionDate.setMonth(transactionDate.getMonth() + txIndex);
  //           break;
  //         case "YEARLY":
  //           transactionDate.setFullYear(transactionDate.getFullYear() + txIndex);
  //           break;
  //         default:
  //           transactionDate.setDate(transactionDate.getDate() + txIndex);
  //       }
  //       const formattedDate = transactionDate.toLocaleDateString("en-GB");
  //       return {
  //         amountLabel: `${payment.amount} ${payment.tokens[0]?.metadata?.symbol || "QASH"}`,
  //         claimableAfterLabel: `Claimable after ${formattedDate}`,
  //       };
  //     });
  //   }
  // });
  // if (!isOpen) return null;
  // return (
  //   <BaseModal
  //     isOpen={isOpen}
  //     onClose={onClose}
  //     title="Back"
  //     icon="/arrow/chevron-left.svg"
  //     zIndex={zIndex}
  //     onClickIcon={onClose}
  //   >
  //     <div className="flex w-full bg-[#1E1E1E] rounded-b-xl">
  //       <div className="flex flex-col gap-[5px] bg-[#292929] rounded-xl py-5 w-[520px] max-md:w-[90%] mt-1.5">
  //         {/* Header */}
  //         <div className="flex items-center justify-between w-full cursor-pointer">
  //           <div className="px-4">
  //             <span className="text-white text-[16px] tracking-[-0.32px]">
  //               Recurring Transfer List ({items.length})
  //             </span>
  //           </div>
  //           {items.length > 0 && (
  //             <button
  //               type="button"
  //               className="flex items-center gap-0.5 px-4 justify-center cursor-pointer"
  //               onClick={() => router.push("/dashboard/schedule-payment")}
  //             >
  //               <span className="text-[16px] text-[#1e8fff]">See all</span>
  //               <img src={`/arrow/chevron-right.svg`} alt="chevron-right" className="w-6 h-6" />
  //             </button>
  //           )}
  //         </div>
  //         {/* List */}
  //         {items.length > 0 ? (
  //           <div className="flex flex-col gap-[5px] px-1.5 py-4">
  //             {items.map((it, idx) => (
  //               <div key={idx} className="w-full">
  //                 <SchedulePaymentCard
  //                   recipientName={it.recipientName}
  //                   amount={it.amount}
  //                   token={it.token}
  //                   frequencyLabel={it.frequencyLabel}
  //                   startDateLabel={it.startDateLabel}
  //                   timesLabel={it.timesLabel}
  //                   onClick={() =>
  //                     openModal(MODAL_IDS.RECURRING_TRANSFER_DETAIL, {
  //                       item: it,
  //                       transactions: transactionsMap[idx],
  //                     })
  //                   }
  //                 />
  //               </div>
  //             ))}
  //           </div>
  //         ) : (
  //           <EmptySchedulePayments />
  //         )}
  //       </div>
  //     </div>
  //   </BaseModal>
  // );
}

export default RecurringTransferModal;
