import { MODAL_IDS } from "@/types/modal";
import * as React from "react";
import toast from "react-hot-toast";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useAccountContext } from "@/contexts/AccountProvider";

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
        <button className="flex gap-1.5 justify-end items-center px-3 py-2.5 bg-white rounded-3xl border-solid cursor-pointer border-[0.567px] border-white border-opacity-40 max-sm:justify-center max-sm:self-stretch">
          <span
            className="text-base font-medium tracking-tight leading-5 text-right text-blue-600"
            onClick={() => {
              openModal(MODAL_IDS.NEW_REQUEST, { recipient: null });
            }}
          >
            New request
          </span>
        </button>
      </div>
      <div className="flex justify-between items-center self-stretch py-2 pr-2 pl-4 bg-blue-600 rounded-full max-md:flex-col max-md:gap-2 max-md:p-3 max-sm:p-2">
        <span className="text-lg font-medium leading-5 text-white max-md:text-base max-md:text-center max-sm:text-sm max-sm:break-all">
          {link}
        </span>
        <button className="flex gap-1.5 justify-end items-center px-4 py-2.5 bg-white rounded-full border-solid cursor-pointer border-[0.567px] border-white border-opacity-40">
          <span
            className="text-base font-medium tracking-tight leading-5 text-right text-blue-600"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied to clipboard");
            }}
          >
            Copy link
          </span>
        </button>
      </div>
    </section>
  );
};
