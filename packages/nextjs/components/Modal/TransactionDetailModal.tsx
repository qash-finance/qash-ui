"use client";

import { ModalHeader } from "../Common/ModalHeader";
import { TransactionSummary } from "../Common/TransactionSummary";
import { SettingsSection } from "../Common/SettingsSection";
import { SignersTable } from "../Common/SignersTable";
import { ShareSection } from "../Common/ShareSection";
import { TransactionDetailModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { BatchTransaction } from "../Common/BatchTransaction";
import BaseModal from "./BaseModal";

const signers: any[] = [
  { id: 1, name: "Maxie", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2", status: "succeed" },
  { id: 2, name: "Jackie Chan", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2", status: "succeed" },
  { id: 3, name: "Hwang Seo", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2", status: "failed" },
  { id: 4, name: "Alexandria", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2", status: "waiting" },
];

export function TransactionDetailModal({
  isOpen,
  onClose,
  onDeny,
  onAccept,
  onCopyLink,
}: ModalProp<TransactionDetailModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Send transaction" icon="/modal/coin-icon.gif">
      <div className="flex flex-col items-center rounded-b-2xl border border-solid bg-stone-900 border-zinc-800 max-h-[800px] overflow-y-auto">
        <main className="flex flex-col gap-1.5 items-start self-stretch px-1.5 pt-1.5 pb-5 flex-[1_0_0] max-md:gap-2.5 max-md:px-1.5 max-md:pt-1.5 max-md:pb-5 max-sm:gap-2 max-sm:px-1 max-sm:pt-1 max-sm:pb-4">
          <TransactionSummary />

          {/* Batch Transaction */}
          <BatchTransaction badgeType="P2ID-R" amount="12,000" recipient="0x...987" isPrivate={true} isAddress={true} />

          <BatchTransaction
            badgeType="P2ID-R"
            amount="12,000"
            recipient="Elon Musk"
            isPrivate={true}
            isAddress={false}
          />

          {/* Token */}
          <div className="flex gap-2 items-center self-stretch p-2.5 rounded-xl bg-zinc-800 max-md:p-3 max-sm:gap-2.5 max-sm:p-2.5">
            <img src="/token/btc.svg" alt="Bitcoin" className="w-7 h-7" />
            <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
              <h3 className="self-stretch text-sm font-medium tracking-tight leading-4 text-white max-md:text-sm max-sm:text-sm">
                Bitcoin
              </h3>
            </div>
            <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
              <div className="self-stretch text-sm font-medium tracking-tight leading-4 text-right max-md:text-sm max-sm:text-xs">
                <span className="text-zinc-500">US$</span>
                <span className="text-white">206,658.921</span>
              </div>
            </div>
          </div>

          {/* Signers */}
          <div className="flex gap-2 items-center self-stretch p-2.5 rounded-xl bg-zinc-800 max-md:p-3 max-sm:gap-2.5 max-sm:p-2.5">
            <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
              <h3 className="self-stretch text-sm font-medium tracking-tight leading-4 text-white max-md:text-sm max-sm:text-sm">
                Alexandria_1
              </h3>
            </div>
            <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0] max-sm:gap-1">
              <div className="self-stretch text-sm font-medium tracking-tight leading-4 text-right max-md:text-sm max-sm:text-xs">
                <span className="text-white">0xda5541C4Aa25B300aa1f12473b8c4341297d3sd1</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <SettingsSection />

          {/* Signers */}
          <SignersTable signers={signers} />
        </main>

        {/* Share */}
        <ShareSection onDeny={onDeny} onAccept={onAccept} onCopyLink={onCopyLink} />
      </div>
    </BaseModal>
  );
}

export default TransactionDetailModal;
