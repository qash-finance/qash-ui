"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BaseContainer } from "../Common/BaseContainer";
import { Table } from "../Common/Table";
import { SecondaryButton } from "../Common/SecondaryButton";
import { TabContainer } from "../Common/TabContainer";
import { StatusBadge } from "../Common/StatusBadge";
import { RequestPaymentStatus } from "@/types/request-payment";
import { Badge, BadgeStatus } from "../Common/Badge";
import { useTitle } from "@/contexts/TitleProvider";
import { useRouter } from "next/navigation";
import { useGetPayrollDetails } from "@/services/api/payroll";

const labelStyles = "py-1 text-sm font-medium text-text-secondary";

// Action renderer for payroll table
const payrollActionRenderer = (rowData: Record<string, any>, index: number) => (
  <div className="flex items-center justify-center w-full">
    <img
      src="/misc/three-dot-icon.svg"
      alt="three dot icon"
      className="w-6 h-6 cursor-pointer"
      data-tooltip-id="payroll-action-tooltip"
      data-tooltip-content={index.toString()}
    />
  </div>
);

const PayrollDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();

  const payrollId = parseInt(searchParams.get("id") || "0", 10);
  const { data: payrollData, isLoading, error } = useGetPayrollDetails(payrollId);

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    if (payrollData?.employee) {
      setTitle(
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Payroll /</span>
          <span className="text-text-primary">{payrollData.employee.name}'s payroll</span>
        </div>,
      );
    }
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      // clean up when component unmounts
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router, payrollData]);

  if (isLoading) {
    return (
      <div className="p-5 flex flex-col items-center justify-center w-full h-full">
        <p className="text-text-secondary">Loading payroll details...</p>
      </div>
    );
  }

  if (error || !payrollData) {
    return (
      <div className="p-5 flex flex-col items-center justify-center w-full h-full">
        <p className="text-red-500">Failed to load payroll details</p>
      </div>
    );
  }

  const paymentHistoryData = [
    {
      "Creation date": new Date(payrollData.createdAt).toLocaleDateString(),
      Invoice: `#INV-${payrollData.id}`,
      Name: payrollData.employee.name,
      Team: "Engineering",
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>{payrollData.amount}</span>
          <img
            alt={payrollData.token.symbol}
            className="w-4"
            src={`/token/${payrollData.token.symbol.toLowerCase()}.svg`}
          />
        </div>
      ),
      "Due Date": new Date(payrollData.payStartDate).toLocaleDateString(),
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge
            text={payrollData.status}
            status={payrollData.status === "ACTIVE" ? BadgeStatus.SUCCESS : BadgeStatus.AWAITING}
            className="px-5"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 flex flex-col items-start justify-start w-full h-full gap-2">
      <span className="font-bold text-3xl mb-4">{payrollData.employee.name}</span>
      <div className="flex gap-3 items-start w-full">
        {/* Employee Information Card */}
        <div className="flex-1 border border-primary-divider rounded-2xl px-4 py-3 flex gap-3 items-center">
          {/* Labels Column */}
          <div className="flex flex-col gap-1 w-[99px]">
            <div className={labelStyles}>Name</div>
            <div className={labelStyles}>Email</div>
            <div className={labelStyles}>Network</div>
            <div className={labelStyles}>Token</div>
            <div className={labelStyles}>Address</div>
          </div>

          {/* Values Column */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="py-1 text-sm font-medium text-text-primary">{payrollData.employee.name}</div>
            <div className="py-1 text-sm font-medium text-primary-blue">{payrollData.employee.email}</div>
            <div className=" py-1 flex items-center gap-2">
              <img
                className="w-5"
                alt={payrollData.network.name}
                src={`/chain/${
                  payrollData.network.name.charAt(0).toUpperCase() + payrollData.network.name.slice(1).toLowerCase()
                }.svg`}
              />
              <span className="text-sm font-medium text-text-primary">
                {payrollData.network.name.charAt(0).toUpperCase() + payrollData.network.name.slice(1)}
              </span>
            </div>
            <div className=" py-1 flex items-center gap-2">
              <img
                alt={payrollData.token.symbol}
                className="w-5 h-5"
                src={`/token/${payrollData.token.symbol.toLowerCase()}.svg`}
              />
              <span className="text-sm font-medium text-text-primary">{payrollData.token.symbol}</span>
            </div>
            <div className=" py-1 flex items-center gap-2 justify-start">
              <span className="text-sm font-medium text-text-primary">{payrollData.employee.walletAddress}</span>
              <div className="w-5 h-5 flex-shrink-0">
                <img alt="Copy" className="w-full h-full" src="/misc/copy-icon.svg" />
              </div>
            </div>
          </div>
        </div>

        {/* Contract Information Card */}
        <div className="flex-1 border border-primary-divider rounded-2xl px-4 py-3 flex gap-3 items-center">
          {/* Labels Column */}
          <div className="flex flex-col gap-1 w-[99px]">
            <div className={labelStyles}>Created on</div>
            <div className={labelStyles}>Contract term</div>
            <div className={labelStyles}>Amount</div>
            <div className={labelStyles}>Pay date</div>
            <div className={labelStyles}>Group</div>
          </div>

          {/* Values Column */}
          <div className="flex-1 flex flex-col gap-1">
            <div className=" py-1 text-sm font-medium text-text-primary">
              {new Date(payrollData.createdAt).toLocaleString()}
            </div>
            <div className=" py-1 text-sm font-medium text-text-primary">
              {`${new Date(payrollData.joiningDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} - ${new Date(payrollData.payEndDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`}
            </div>
            <div className=" py-1 flex items-center gap-1">
              <img
                alt={payrollData.token.symbol}
                className="w-5"
                src={`/token/${payrollData.token.symbol.toLowerCase()}.svg`}
              />
              <span className="text-sm font-medium text-text-primary">
                {payrollData.amount} {payrollData.token.symbol} / month
              </span>
            </div>
            <div className=" py-1 text-sm font-medium text-text-primary">{payrollData.payrollCycle}th monthly</div>
            <div className=" py-1 flex items-center gap-1">
              <div className="bg-blue-500/20 rounded-full px-3 py-1 flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-sm transform rotate-45" />
                </div>
                <span className="text-xs font-medium text-blue-500">Employee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center py-3 px-5">
            <div className="flex flex-col gap-1">
              <TabContainer
                tabs={[
                  { id: "all", label: "All" },
                  { id: "awaiting", label: "Awaiting" },
                  { id: "paid", label: "Paid" },
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        }
        childrenClassName="p-5 gap-5"
        containerClassName="w-full h-full bg-[#F6F6F6]"
      >
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-2xl font-medium leading-none">Payment History</span>
            <span className="text-text-secondary text-[14px] font-medium leading-none">
              See monthly records, invoice status, and all past payments.
            </span>
          </div>

          {/* Filter Button */}
          <div className="flex items-center gap-2">
            <SecondaryButton
              text="Sort"
              icon="/misc/sort-icon.svg"
              onClick={() => console.log("Sort button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            />
            <SecondaryButton
              text="Filter"
              icon="/wallet-analytics/setting-icon.gif"
              onClick={() => console.log("Filter button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            />
          </div>
        </div>
        <Table
          headers={["Creation date", "Invoice", "Name", "Team", "Amount", "Due Date", "Status"]}
          data={paymentHistoryData}
          className="w-full"
          rowClassName="py-5"
          headerClassName="py-3"
          showPagination={true}
          actionColumn={true}
          actionRenderer={payrollActionRenderer}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </BaseContainer>
    </div>
  );
};

export default PayrollDetail;
