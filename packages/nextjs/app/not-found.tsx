"use client";
import React from "react";
import Link from "next/link";
import { actionItems } from "../components/Sidebar/Sidebar";

export default function NotFound() {
  return (
    <div
      data-testid="not-found"
      className="bg-[#f6f6f6] absolute size-full w-full h-full top-0 left-0 flex flex-col items-center justify-center overflow-hidden z-9999"
    >
      {/* Background decorative circles */}
      <div className="absolute left-1/2 size-[838px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <img alt="" className="block max-w-none size-full" height="838" src="/dark-dotted-circle.svg" width="838" />
      </div>
      <div className="absolute left-1/2 size-[1227px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <img
          alt=""
          className="block max-w-none size-full"
          height="1226.996"
          src="/light-dotted-circle.svg"
          width="1226.996"
        />
      </div>

      {/* Large 404 text */}
      <div className="relative flex flex-col font-['Neue_Montreal:Bold',_sans-serif] justify-center leading-[0] not-italic text-[#ffffff] text-[433.262px]">
        <p
          className="block leading-[81.237px] text-center"
          style={{
            textShadow: "0 0 1px #1E8FFF",
            WebkitTextStroke: "1px #1E8FFF",
          }}
        >
          404
        </p>
      </div>

      {/* Blue accent bar */}
      <span className="bg-[#066eff] text-white text-6xl font-bold mx-auto p-[10px] w-full text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-darken">
        PAGE NOT FOUND
      </span>

      {/* Navigation breadcrumbs */}
      <div className="absolute bottom-[18px] left-4 w-[238px] flex flex-col">
        {actionItems
          .flatMap(section =>
            section.items.map(item => ({
              href: `/${item.link}`,
              label: item.label.toLowerCase(),
              disabled: item.disabled,
            })),
          )
          .map((item, globalIndex) => ({
            ...item,
            number: String(globalIndex + 1).padStart(2, "0"),
          }))
          .map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-[7px] py-[5px] pr-2 w-full font-['Neue_Montreal:Medium',_sans-serif] text-[16px] tracking-[-0.32px] uppercase hover:bg-[#066eff] hover:text-white transition-colors ${
                item.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={e => item.disabled && e.preventDefault()}
            >
              <div className="text-[#d8d8d8] text-center w-[38.971px] ">
                <p className="adjustLetterSpacing leading-none">{item.number}</p>
              </div>
              <div className="flex-1 text-left ">
                <p className="leading-none">{item.label}</p>
              </div>
              <img alt="" className="w-4 h-4" src="/arrow/thin-arrow-up-right.svg" />
            </Link>
          ))}
      </div>

      {/* Description text */}
      <div className="absolute left-[34.857px] top-[31.697px] w-[309.652px] font-['Neue_Montreal:Medium',_sans-serif] text-black text-[16px] text-left tracking-[-0.32px] uppercase">
        <p className="adjustLetterSpacing leading-none">
          Designed for crypto natives and expert users, our platform offers powerful tools to automate, customize, and
          optimize financial transactions.
        </p>
      </div>

      {/* Social media links */}
      <div className="absolute right-4 top-[15px] w-[119px] flex flex-col gap-1.5">
        {[
          {
            handle: "@q3x_finance",
            link: "https://x.com/q3x_finance",
            icon: "/social/twitter.svg",
            height: "14.118px",
          },
          { handle: "@q3x", link: "https://github.com/q3x", icon: "/social/github.svg", height: "14.694px" },
          { handle: "@q3xfinance", link: "https://t.me/q3xfinance", icon: "/social/telegram.svg", height: "16.579px" },
        ].map(social => (
          <div key={social.link} className="flex items-center gap-1 h-[19.344px] w-full">
            <div className="flex-1 font-['Neue_Montreal:Regular',_sans-serif] text-[#191919] text-[15px] text-left">
              <p
                className="leading-none hover:underline cursor-pointer"
                onClick={() => window.open(social.link, "_blank")}
              >
                {social.handle}
              </p>
            </div>
            <div className={`h-[${social.height}] w-[15px]`}>
              <img alt="" className="w-full h-full" src={social.icon} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
