import * as React from "react";

export const PendingRequestSection: React.FC = () => {
  return (
    <section className="flex flex-col gap-2.5 items-start self-stretch">
      <header className="flex flex-col gap-2 justify-center items-start w-[1076px] max-md:w-full">
        <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
          Pending payment request
        </h2>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
          Once you accept, you're committing to send the amount to the request address
        </p>
      </header>
      <div className="flex flex-col gap-1 justify-center items-center self-stretch rounded-xl bg-zinc-800 h-[100px] max-sm:h-20">
        <img src="/no-request-icon.svg" alt="No request" className="shrink-0 w-6 h-6 opacity-50" />
        <p className="text-sm tracking-tight leading-4 text-neutral-500">No request</p>
      </div>
    </section>
  );
};
