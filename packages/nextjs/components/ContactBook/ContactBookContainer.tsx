import React, { useState } from "react";
import { Header } from "./Header";
import { EmployeeContact } from "./EmployeeContact";
import { ClientContact } from "./ClientContact";
import { createShapeElement } from "../Common/ToolTip/ShapeSelectionTooltip";
import { CategoryShapeEnum } from "@/types/employee";

export const CategoryTab = ({ label }: { label: React.ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 h-10">
      <img src="/misc/category-icon.svg" alt="category" className="w-5 h-5" />
      <span className="text-text-primary truncate">{label}</span>
    </div>
  );
};

export const CategoryBadge = ({ shape, color, name }: { shape: CategoryShapeEnum; color: string; name: string }) => {
  // Special design for "Client" - just orange text without background or icon
  if (name === "Client") {
    return (
      <span className="font-semibold text-[#F5A623]">
        {name}
      </span>
    );
  }

  return (
    <div
      className={`flex flex-row items-center justify-center gap-3 px-3 py-1 rounded-full border w-fit`}
      style={{ borderColor: color, backgroundColor: `${color}20` }}
    >
      {createShapeElement(shape, color)}
      <span className="-mt-0.5 font-semibold truncate" style={{ color: color }}>
        {name}
      </span>
    </div>
  );
};

const ContactBookContainer = () => {
  const [activeContactTab, setActiveContactTab] = useState<"employee" | "client">("employee");

  const renderTabContent = () => {
    switch (activeContactTab) {
      case "employee":
        return <EmployeeContact />;
      case "client":
        return <ClientContact />;
    }
  };

  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-4 px-5">
        <Header />
      </div>

      {/** Employee or Client tab */}
      <div className="w-full flex flex-row border-b border-primary-divider relative">
        <div
          className="flex items-center justify-center px-10 py-3 w-[180px] cursor-pointer group transition-colors duration-300"
          onClick={() => setActiveContactTab("employee")}
        >
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeContactTab === "employee"
                ? "text-text-strong-950"
                : "text-text-soft-400 group-hover:text-text-soft-500"
            }`}
          >
            Employee
          </p>
        </div>
        <div
          className="flex items-center justify-center px-10 py-3 w-[180px] cursor-pointer transition-colors duration-300"
          onClick={() => setActiveContactTab("client")}
        >
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeContactTab === "client" ? "text-text-strong-950" : "text-text-soft-400"
            }`}
          >
            Client
          </p>
        </div>
        <div
          className="absolute bottom-0 h-[3px] bg-primary-blue transition-all duration-300"
          style={{
            width: "180px",
            left: activeContactTab === "employee" ? "0px" : "180px",
          }}
        />
      </div>

      {renderTabContent()}
    </div>
  );
};

export default ContactBookContainer;
