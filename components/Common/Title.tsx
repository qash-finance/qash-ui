import React from "react";
import { usePathname } from "next/navigation";
import TabContainer from "./TabButton";

export const Title = () => {
  const pathname = usePathname();
  let title;

  switch (pathname) {
    case "/send":
      title = "Send tokens";
      break;
    case "/dashboard/pending-recieve":
      title = "Dashboard";
      break;
    case "/dashboard/pending-request":
      title = "Dashboard";
      break;
    case "/dashboard/recall-transaction":
      title = "Dashboard";
      break;
    case "/batch":
      title = "Your Batch";
      break;
    default:
      title = "Miden Q3x";
  }
  return (
    <div className="w-[100%] px-1 py-2 bg-[#292929] rounded-lg inline-flex justify-between items-center h-[50px]">
      <div className="w-8 h-0 rotate-90 outline-[2px] outline-[#48B3FF]" />
      <div className="font-medium font-['Barlow'] uppercase leading-none text-white text-xl font-bolds flex-1">
        <span className="text-left">{title}</span>
      </div>
      {pathname.startsWith("/dashboard") && <TabContainer />}
    </div>
  );
};
