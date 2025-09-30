import React, { useState } from "react";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table } from "../Common/Table";

const ContactBookContainer = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-4 px-5">
        <Header />
      </div>
      <BaseContainer
        header={
          <div className="w-full flex flex-row items-center justify-between gap-2 px-6 py-4">
            <div className="flex flex-row items-center justify-center gap-2">
              <TabContainer
                tabs={[{ id: "all", label: "All Categories" }]}
                activeTab={activeTab}
                setActiveTab={tab => setActiveTab(tab)}
              />
              <div className="flex flex-row items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-1.5">
                <img src="/misc/plus-icon.svg" alt="plus-icon" className="w-full" style={{ filter: "invert(1)" }} />
              </div>
            </div>
            <span className="text-text-primary">120 contacts</span>
          </div>
        }
        children={<Table data={[]} headers={[]} />}
        containerClassName="w-full"
      />
    </div>
  );
};

export default ContactBookContainer;
