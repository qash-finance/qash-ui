import { MODAL_IDS } from "@/types/modal";
import * as React from "react";
import toast from "react-hot-toast";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useAccountContext } from "@/contexts/AccountProvider";
import { ActionButton } from "@/components/Common/ActionButton";

export const RequestLinkSection: React.FC = () => {
  const { openModal } = useModal();
  const { accountId } = useAccountContext();
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pending-request?recipient=${accountId}`;

  return (
    <section className="flex flex-col gap-2.5 items-start self-stretch">
      <div className="flex gap-2.5 items-start self-stretch max-sm:flex-col max-sm:gap-2">
        <div className="flex flex-col gap-2 justify-center items-start flex-[1_0_0]">
          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">Request link</h2>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
            people who have this link can request a payment from you
          </p>
        </div>
        <ActionButton
          text="New request"
          type="neutral"
          onClick={() => openModal(MODAL_IDS.NEW_REQUEST, { recipient: null })}
          className="h-[40px] text-md"
        />
      </div>
      <div className="flex justify-between items-center self-stretch py-2 pr-2 pl-4 bg-blue-600 rounded-xl max-md:flex-col max-md:gap-2 max-md:p-3 max-sm:p-2">
        <span className="text-lg font-medium leading-5 text-white max-md:text-base max-md:text-center max-sm:text-sm max-sm:break-all">
          {link}
        </span>
        <button
          className="flex items-center px-2 py-1.5 bg-white rounded-lg border-solid cursor-pointer border-[0.567px] border-white border-opacity-40"
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast.success("Link copied to clipboard");
          }}
        >
          <img src="/copy-icon.svg" alt="Copy link" className="scale-110" />
        </button>
      </div>
    </section>
  );
};
