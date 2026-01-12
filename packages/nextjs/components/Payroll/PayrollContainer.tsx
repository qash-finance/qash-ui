"use client";
import React, { useState, useEffect } from "react";
import { useGetPayrolls, useDeletePayroll } from "@/services/api/payroll";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { Table } from "../Common/Table";
import PayrollActionTooltip from "../Common/ToolTip/PayrollActionTooltip";
import { Tooltip } from "react-tooltip";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { CategoryShapeEnum } from "@/types/employee";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalManagerProvider";

const PayrollContainer = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: groups } = useGetAllEmployeeGroups();
  const { openModal } = useModal();

  // Debounce search input - update debouncedSearch after 1 second of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page when search changes
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch payrolls from API
  const { data, isLoading, isError, refetch } = useGetPayrolls({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
  });

  // Delete payroll mutation
  const deletePayroll = useDeletePayroll();

  // Action handlers
  const handleEditPayroll = (id: number) => {
    router.push(`/payroll/edit?id=${id}`);
  };

  const handleRemovePayroll = (id: number) => {
    openModal("REMOVE_PAYROLL", {
      payrollId: id,
      payrollOwnerName: data?.payrolls.find(payroll => payroll.id === id)?.employee.name || "",
      onRemove: async () => {
        await deletePayroll.mutateAsync(id);
        refetch();
      },
    });
  };

  // Action renderer for payroll table
  const payrollActionRenderer = (rowData: Record<string, any>, index: number) => (
    <div className="flex items-center justify-center w-full" onClick={e => e.stopPropagation()}>
      <img
        src="/misc/three-dot-icon.svg"
        alt="three dot icon"
        className="w-6 h-6 cursor-pointer"
        data-tooltip-id="payroll-action-tooltip"
        data-tooltip-content={rowData.__id?.toString()}
      />
    </div>
  );

  // Transform API data to table format
  const payrollData = (data?.payrolls || []).map(payroll => {
    return {
      __id: payroll.id,
      "Employee name": payroll.employee.name,
      Group: (
        <div className="flex justify-center items-center">
          <CategoryBadge
            shape={groups?.find(grp => grp.id === payroll?.employee?.groupId)?.shape || CategoryShapeEnum.CIRCLE}
            color={groups?.find(grp => grp.id === payroll?.employee?.groupId)?.color || "#35ADE9"}
            name={groups?.find(grp => grp.id === payroll?.employee?.groupId)?.name || "-"}
          />
        </div>
      ),
      Amount: (
        <div className="flex flex-row justify-center items-center gap-2">
          <img src={`/token/${payroll.token.symbol.toLowerCase()}.svg`} alt="token" className="w-5" />
          <span className="font-bold">
            {payroll.amount} {payroll.token.symbol.toUpperCase()}
          </span>
        </div>
      ),
      Payday: payroll.paydayDay ? `${payroll.paydayDay}th every month` : "-",
      "Contract Term": <span className="font-bold text-primary-blue">{payroll.payrollCycle} Months</span>,
      " ": null, // Placeholder for action column
    };
  });

  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <Header />

      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center p-5">
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-2xl font-medium leading-none">Overview</span>
              <span className="text-text-secondary text-[14px] font-medium leading-none">
                Create payroll for your employees and wait for them to review auto sent invoices then pay the bills in
                one click.
              </span>
            </div>
            <div className="flex flex-row gap-5">
              {/* Search Bar */}
              <form
                className="bg-app-background border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-2 rounded-lg w-[300px]"
                onSubmit={e => {
                  e.preventDefault();
                  setDebouncedSearch(search);
                  setCurrentPage(1);
                }}
              >
                <div className="flex flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search by name"
                    className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
                >
                  <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
                </button>
              </form>

              {/* Filter Button */}
              <div className="flex items-center gap-2">
                {/* TODO: IMPLEMENT SORT AND FILTER */}
                {/* <SecondaryButton
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
                /> */}
              </div>
            </div>
          </div>
        }
        childrenClassName="p-5"
        containerClassName="w-full h-full bg-[#F6F6F6]"
      >
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-10">Loading payrolls...</div>
        ) : isError ? (
          <div className="w-full flex justify-center items-center py-10 text-red-500">Failed to load payrolls.</div>
        ) : (
          <Table
            headers={["Employee name", "Group", "Amount", "Payday", "Contract Term"]}
            data={payrollData}
            actionColumn={true}
            actionRenderer={payrollActionRenderer}
            className="w-full"
            columnWidths={{
              0: "200px",
            }}
            rowClassName="py-5"
            headerClassName="py-3"
            showPagination={true}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            onRowClick={rowData => {
              const payrollId = (rowData as any).__id;
              router.push(`/payroll/detail?id=${payrollId}`);
            }}
            noDataMessage="No payrolls found"
          />
        )}
      </BaseContainer>

      {/* Payroll Action Tooltip */}
      <Tooltip
        id="payroll-action-tooltip"
        clickable
        style={{
          zIndex: 20,
          borderRadius: "16px",
          padding: "0",
        }}
        place="left"
        openOnClick
        noArrow
        border="none"
        opacity={1}
        render={({ content }) => {
          if (!content) return null;
          const id = parseInt(content, 10);
          return <PayrollActionTooltip onEdit={() => handleEditPayroll(id)} onRemove={() => handleRemovePayroll(id)} />;
        }}
      />
    </div>
  );
};

export default PayrollContainer;
