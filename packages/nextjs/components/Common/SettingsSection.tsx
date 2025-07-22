"use client";

export function SettingsSection() {
  return (
    <section className="flex flex-col gap-2 items-start self-stretch">
      <h2 className="self-stretch text-base tracking-tighter leading-5 text-white max-sm:text-sm">Setups</h2>
      <div className="flex gap-1 items-start self-stretch max-md:flex-col max-md:gap-1.5">
        <div className="flex gap-2.5 items-center px-2.5 pt-2.5 pb-2.5 rounded-lg bg-[#292929] flex-[1_0_0] max-md:w-full">
          <span className="text-sm tracking-tight leading-4 text-white flex-[1_0_0] max-sm:text-sm">
            Send as a gift
          </span>
          <div className="flex gap-0.5 justify-center items-center px-1 py-1 rounded-sm bg-blend-luminosity bg-stone-50 bg-opacity-10 h-[11px] w-[11px]" />
        </div>

        <div className="flex gap-2.5 items-center px-2.5 pt-2.5 pb-2.5 rounded-lg bg-[#292929] flex-[1_0_0] max-md:w-full">
          <span className="text-sm tracking-tight leading-4 text-white flex-[1_0_0] max-sm:text-sm">Private</span>
          <div className="flex gap-0.5 justify-center items-center px-1 py-1 rounded-sm bg-blend-luminosity bg-stone-50 bg-opacity-10 h-[11px] w-[11px]" />
        </div>

        <div className="flex gap-2.5 items-center px-2.5 pt-2.5 pb-2.5 rounded-lg bg-[#292929] flex-[1_0_0] max-md:w-full">
          <span className="text-sm tracking-tight leading-4 text-white flex-[1_0_0] max-sm:text-sm">Recall in</span>
          <span className="text-sm tracking-tight leading-4 text-white max-sm:text-sm">1Hour</span>
        </div>
      </div>
    </section>
  );
}
