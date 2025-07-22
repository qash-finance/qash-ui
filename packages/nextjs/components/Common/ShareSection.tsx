"use client";

import { ActionButton } from "./ActionButton";

interface ShareSectionProps {
  onDeny?: () => void;
  onAccept?: () => void;
  onCopyLink?: () => void;
}

export function ShareSection({ onDeny, onAccept, onCopyLink }: ShareSectionProps) {
  return (
    <footer className="flex gap-3 items-end self-stretch pt-2.5 pr-4 pb-4 pl-3 bg-[#292929] max-md:flex-col max-md:gap-2.5 rounded-b-xl">
      <div className="flex flex-col gap-2 justify-center items-start flex-[1_0_0] max-md:w-full">
        <h3 className="text-base tracking-tighter leading-5 text-white max-sm:text-sm">Share to others signer</h3>
        <div className="flex gap-2 items-center self-stretch py-1.5 pr-1.5 pl-3 bg-white rounded-xl">
          <span className="overflow-hidden text-base font-medium leading-5 text-blue-600 flex-[1_0_0] text-ellipsis max-sm:text-sm">
            http://q3x.io/redpacket
          </span>
          <button
            className="flex gap-1.5 justify-center items-center px-2 py-1 bg-blue-600 rounded-lg"
            onClick={onCopyLink}
          >
            <span className="text-sm font-medium tracking-tight leading-4 text-white max-sm:text-xs">Copy link</span>
            <img
              src="/copy-icon.svg"
              alt="copy-icon"
              className="w-4 h-4"
              style={{ filter: "invert(1) brightness(1000%)" }}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 items-center max-md:justify-between max-md:w-full max-sm:flex-col max-sm:gap-2">
        <ActionButton text="Deny" type="deny" onClick={onDeny} className="h-9" />

        <ActionButton text="Accept" onClick={onAccept} className="h-9" />
      </div>
    </footer>
  );
}
