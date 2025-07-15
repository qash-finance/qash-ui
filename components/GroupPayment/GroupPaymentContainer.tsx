"use client";
import * as React from "react";
import { GroupCard } from "./GroupCard";
import { PaymentDetails } from "./PaymentDetails";

const GroupPaymentContainer: React.FC = () => {
  const groupsData = [
    {
      imageSrc: "/group-payment/default-group-payment-avatar.svg",
      title: "Best Friends",
      memberCount: 7,
    },
    {
      imageSrc: "/group-payment/default-group-payment-avatar.svg",
      title: "Lunch order at company",
      memberCount: 5,
    },
    {
      imageSrc: "/group-payment/default-group-payment-avatar.svg",
      title: "Concert GD",
      memberCount: 36,
    },
    {
      imageSrc: "/group-payment/default-group-payment-avatar.svg",
      title: "Korea Travelling 2025",
      memberCount: 5,
    },
  ];

  return (
    <main className="overflow-hidden self-stretch px-4 pt-5 pb-4 rounded-2xl bg-neutral-950 w-full">
      <div className="pb-4 w-full max-md:max-w-full">
        <header className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
          <div className="flex gap-1.5 items-center text-white">
            <h1 className="self-stretch my-auto text-lg font-medium leading-none text-center text-white">Your group</h1>
            <div className=" bg-neutral-700 rounded-full">
              <span className="px-2 py-1 text-white">4</span>
            </div>
          </div>
          <button
            className={`font-barlow font-medium text-sm transition-colors cursor-pointer bg-white text-blue-600 h-8`}
            style={{
              padding: "6px 10px 8px 10px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              letterSpacing: "-0.084px",
              lineHeight: "100%",
              boxShadow:
                "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
            }}
            onClick={() => {}}
          >
            New group
          </button>
        </header>

        <section className="flex overflow-hidden gap-2.5 items-start mt-2.5 w-full max-md:max-w-full">
          {groupsData.map((group, index) => (
            <GroupCard key={index} imageSrc={group.imageSrc} title={group.title} memberCount={group.memberCount} />
          ))}
        </section>
      </div>

      <section className="flex-1 mt-2 w-full max-md:max-w-full h-[74%]">
        <h2 className="text-lg font-medium leading-none text-white max-md:max-w-full">Quick share</h2>
        <PaymentDetails
          amount="7,000"
          perPersonAmount="1,400"
          groupName="Lunch order at company"
          memberCount={5}
          shareLink="http://q3x.io/redpacket"
        />
      </section>
    </main>
  );
};

export default GroupPaymentContainer;
