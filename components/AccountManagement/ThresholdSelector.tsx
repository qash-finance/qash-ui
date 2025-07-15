"use client";
import * as React from "react";

export function ThresholdSelector() {
  return (
    <section className="flex gap-5 items-center self-stretch max-sm:flex-col max-sm:gap-2.5 max-sm:items-start">
      <div className="flex flex-col gap-1 justify-center items-start flex-[1_0_0]">
        <h3 className="text-base font-medium leading-4 text-center text-white">Threshold</h3>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500">
          Any transaction requires the confirmation of
        </p>
      </div>

      <div className="relative h-11 rounded-xl border border-solid bg-stone-900 border-neutral-600 w-[245px] max-md:w-[200px] max-sm:w-full">
        <span className="absolute top-3 h-5 text-base leading-5 text-center text-white left-[41px] w-[78px] max-md:left-[31px] max-sm:left-5">
          03
        </span>
        <span className="absolute text-base font-medium leading-5 h-[19px] left-[10px] text-neutral-500 top-[13px] w-[61px] max-md:left-[140px] max-sm:left-[120px]">
          6 Signers
        </span>

        <button className="absolute left-[11px] top-[10px]">
          <div
            dangerouslySetInnerHTML={{
              __html:
                '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="threshold-minus" style="width: 24px; height: 24px; flex-shrink: 0; fill: rgba(248,248,248,0.17); stroke-width: 0.504px; stroke: rgba(255,255,255,0.40); background-blend-mode: luminosity"> <rect x="0.5" y="0.413086" width="24.31" height="24" rx="6" fill="#F8F8F8" fill-opacity="0.17" style="mix-blend-mode:luminosity"></rect> <rect x="0.752199" y="0.665285" width="23.8056" height="23.4956" rx="5.7478" stroke="url(#paint0_linear_5579_28041)" stroke-opacity="0.25" stroke-width="0.504398"></rect> <path d="M10.0387 13.3813C9.98535 13.3813 9.93735 13.3653 9.89468 13.3333C9.86268 13.2906 9.84668 13.2426 9.84668 13.1893V11.6373C9.84668 11.584 9.86268 11.5413 9.89468 11.5093C9.93735 11.4666 9.98535 11.4453 10.0387 11.4453H15.2707C15.324 11.4453 15.3667 11.4666 15.3987 11.5093C15.4413 11.5413 15.4627 11.584 15.4627 11.6373V13.1893C15.4627 13.2426 15.4413 13.2906 15.3987 13.3333C15.3667 13.3653 15.324 13.3813 15.2707 13.3813H10.0387Z" fill="white"></path> <defs> <linearGradient id="paint0_linear_5579_28041" x1="12.655" y1="0.413086" x2="22.9979" y2="26.8589" gradientUnits="userSpaceOnUse"> <stop stop-color="white" stop-opacity="0.4"></stop> <stop offset="0.4" stop-color="white" stop-opacity="0.01"></stop> <stop offset="0.6" stop-color="white" stop-opacity="0.01"></stop> <stop offset="1" stop-color="white" stop-opacity="0.1"></stop> </linearGradient> </defs> </svg>',
            }}
          />
        </button>

        <button className="absolute left-[126px] top-[10px]">
          <div
            dangerouslySetInnerHTML={{
              __html:
                '<svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="threshold-plus" style="width: 24px; height: 24px; flex-shrink: 0; fill: rgba(248,248,248,0.17); stroke-width: 0.504px; stroke: rgba(255,255,255,0.40); background-blend-mode: luminosity"> <rect x="0.96875" y="0.413086" width="24.31" height="24" rx="6" fill="#F8F8F8" fill-opacity="0.17" style="mix-blend-mode:luminosity"></rect> <rect x="1.22095" y="0.665285" width="23.8056" height="23.4956" rx="5.7478" stroke="url(#paint0_linear_5579_28043)" stroke-opacity="0.25" stroke-width="0.504398"></rect> <path d="M16.3552 11.4693C16.4086 11.4693 16.4512 11.4906 16.4832 11.5333C16.5259 11.5653 16.5472 11.6079 16.5472 11.6613V13.2133C16.5472 13.2666 16.5259 13.3146 16.4832 13.3573C16.4512 13.3893 16.4086 13.4053 16.3552 13.4053H14.1632C14.1099 13.4053 14.0832 13.4319 14.0832 13.4853V15.6453C14.0832 15.6986 14.0619 15.7466 14.0192 15.7893C13.9872 15.8213 13.9446 15.8373 13.8912 15.8373H12.3552C12.3019 15.8373 12.2539 15.8213 12.2112 15.7893C12.1792 15.7466 12.1632 15.6986 12.1632 15.6453V13.4853C12.1632 13.4319 12.1366 13.4053 12.0832 13.4053H9.89122C9.83789 13.4053 9.78989 13.3893 9.74722 13.3573C9.71522 13.3146 9.69922 13.2666 9.69922 13.2133V11.6613C9.69922 11.6079 9.71522 11.5653 9.74722 11.5333C9.78989 11.4906 9.83789 11.4693 9.89122 11.4693H12.0832C12.1366 11.4693 12.1632 11.4426 12.1632 11.3893V9.18126C12.1632 9.12792 12.1792 9.08526 12.2112 9.05326C12.2539 9.01059 12.3019 8.98926 12.3552 8.98926H13.8912C13.9446 8.98926 13.9872 9.01059 14.0192 9.05326C14.0619 9.08526 14.0832 9.12792 14.0832 9.18126V11.3893C14.0832 11.4426 14.1099 11.4693 14.1632 11.4693H16.3552Z" fill="white"></path> <defs> <linearGradient id="paint0_linear_5579_28043" x1="13.1237" y1="0.413086" x2="23.4666" y2="26.8589" gradientUnits="userSpaceOnUse"> <stop stop-color="white" stop-opacity="0.4"></stop> <stop offset="0.4" stop-color="white" stop-opacity="0.01"></stop> <stop offset="0.6" stop-color="white" stop-opacity="0.01"></stop> <stop offset="1" stop-color="white" stop-opacity="0.1"></stop> </linearGradient> </defs> </svg>',
            }}
          />
        </button>
      </div>
    </section>
  );
}
