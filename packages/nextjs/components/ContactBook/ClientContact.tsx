import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/navigation";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table, CellContent } from "../Common/Table";
import { MoreActionsTooltip } from "../Common/ToolTip/MoreActionsTooltip";
import { MultipleContactActionsTooltip } from "../Common/ToolTip/MultipleContactActionsTooltip";
import { useGetClients, useDeleteClient } from "@/services/api/client";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import toast from "react-hot-toast";
import { useAuth } from "@/services/auth/context";
import { useForm } from "react-hook-form";

export const ClientContact = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const deleteClientMutation = useDeleteClient();
  const { data: clientsResponse, isLoading: isLoadingClients } = useGetClients(
    { page: 1, limit: 1000 },
    { enabled: isAuthenticated },
  );
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [showMultipleActions, setShowMultipleActions] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { register, watch } = useForm({
    defaultValues: {
      searchTerm: "",
    },
  });

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any tooltip trigger or tooltip content
      if (!target.closest("[data-tooltip-id]") && !target.closest(".tooltip-content")) {
        setActiveTooltipId(null);
        setShowMultipleActions(false);
      }
    };

    if (activeTooltipId || showMultipleActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltipId, showMultipleActions]);

  const clients = clientsResponse?.data || [];
  const isLoadingAddressBooks = isLoadingClients;

  // useEffect(() => {
  //   if (groups) {
  //     const visiblegroups = groups.slice(0, 3);
  //     const remainingCount = groups.length - 3;

  //     const categoryTabs = visiblegroups.map(category => ({
  //       id: category.id.toString(),
  //       label: <CategoryTab label={category.name} />,
  //     }));

  //     if (remainingCount > 0) {
  //       categoryTabs.push({
  //         id: "more",
  //         label: (
  //           <div
  //             data-tooltip-id="category-more-tooltip"
  //             className="flex flex-row items-center justify-center gap-2 h-10 cursor-pointer"
  //           >
  //             <img src="/misc/category-icon.svg" alt="category" className="w-5 h-5" />
  //             <span className="text-text-primary truncate">{remainingCount} more...</span>
  //           </div>
  //         ),
  //       });
  //     }

  //     setTabs(categoryTabs);
  //   }
  // }, []);

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    if (checkedRows.length === (clients?.length || 0)) {
      setCheckedRows([]);
    } else {
      setCheckedRows(clients?.map((_, idx) => idx) || []);
    }
  };

  const isAllChecked = !!(clients && clients.length > 0 && checkedRows.length === clients.length);

  // Tooltip action handlers
  const handlePay = (clientIndex: number) => {
    const client = clients[clientIndex];
    if (client) {
      toast.success("Client: " + client.companyName);
      setActiveTooltipId(null);
    }
  };

  const handleEdit = (clientIndex: number) => {
    const client = clients[clientIndex];
    if (client) {
      openModal(MODAL_IDS.EDIT_CLIENT_CONTACT, {
        clientData: {
          uuid: client.uuid,
          email: client.email,
          companyName: client.companyName,
          companyType: client.companyType,
          country: client.country,
          city: client.city,
          address1: client.address1,
          address2: client.address2,
          taxId: client.taxId,
          postalCode: client.postalCode,
          registrationNumber: client.registrationNumber,
        },
      });
      setActiveTooltipId(null);
    }
  };

  const handleExport = (clientIndex: number) => {
    const client = clients[clientIndex];
    if (client) {
      console.log("Export client:", client);
      // TODO: Implement export functionality
      setActiveTooltipId(null);
    }
  };

  const handleRemove = (clientIndex: number) => {
    const client = clients[clientIndex];
    if (client) {
      openModal(MODAL_IDS.REMOVE_CONTACT_CONFIRMATION, {
        contactName: client.companyName,
        contactAddress: client.email,
        onRemove: () => {
          deleteClientMutation.mutate(client.uuid, {
            onSuccess: () => {
              toast.success("Client deleted successfully");
              setActiveTooltipId(null);
            },
            onError: error => {
              console.error("Failed to delete client:", error);
              toast.error("Failed to delete client");
            },
          });
        },
      });
    }
  };

  // Multiple client action handlers
  const handleMultipleExport = () => {
    const selectedClients = checkedRows.map(index => clients[index]).filter(Boolean);
    console.log("Export multiple clients:", selectedClients);
    // TODO: Implement multiple export functionality
    setShowMultipleActions(false);
  };

  const handleMultipleRemove = () => {
    const selectedClients = checkedRows.map(index => clients[index]).filter(Boolean);
    if (selectedClients.length > 0) {
      openModal(MODAL_IDS.REMOVE_CONTACT_CONFIRMATION, {
        contactName: `${selectedClients.length} clients`,
        contactAddress: "",
        onRemove: () => {
          selectedClients.forEach(client => {
            deleteClientMutation.mutate(client.uuid, {
              onSuccess: () => {
                if (selectedClients.indexOf(client) === selectedClients.length - 1) {
                  toast.success(`${selectedClients.length} clients deleted successfully`);
                  setCheckedRows([]);
                  setShowMultipleActions(false);
                }
              },
              onError: error => {
                console.error("Failed to delete client:", error);
                toast.error("Failed to delete client");
              },
            });
          });
        },
      });
    }
  };

  const handleReorder = (reorderedData: Record<string, CellContent>[]) => {
    // Clients don't support reordering
    toast.success("Reordering is not available for clients");
  };

  // Format client data for table
  const tableHeaders = [
    <div className="flex justify-center items-center">
      <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
    </div>,
    "Company Name",
    "Email",
    "Country",
    "City",
    "Type",
    " ",
  ];

  const tableData = clients.map((client, index) => {
    return {
      "header-0": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />
        </div>
      ),
      "Company Name": client.companyName,
      Email: client.email || "-",
      Country: client.country || "-",
      City: client.city || "-",
      Type: client.companyType || "-",
      " ": (
        <div className="flex justify-center items-center">
          <div
            data-tooltip-id={checkedRows.length > 0 ? "multiple-actions-tooltip" : `more-actions-${index}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              if (checkedRows.length > 0) {
                setShowMultipleActions(!showMultipleActions);
                setActiveTooltipId(null);
              } else {
                setActiveTooltipId(activeTooltipId === `more-actions-${index}` ? null : `more-actions-${index}`);
                setShowMultipleActions(false);
              }
            }}
          >
            <img src="/misc/three-dot-icon.svg" alt="more actions" className="w-6 h-6" />
          </div>
        </div>
      ),
    };
  });

  return (
    <BaseContainer
      header={
        <div className="w-full flex flex-row items-center justify-between gap-2 px-6 py-4">
          <div className="bg-[#F5F5F6] border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
            <div className="flex flex-row gap-2 flex-1">
              <input
                type="text"
                placeholder="Search by name"
                className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                {...register("searchTerm")}
              />
            </div>
            <button
              type="button"
              className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
            >
              <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
            </button>
          </div>
          <span className="text-text-primary">{clients.length || 0} clients</span>
        </div>
      }
      containerClassName="w-full h-full"
    >
      <div className="w-full p-5 h-full">
        <Table
          data={tableData}
          headers={tableHeaders}
          draggable={false}
          columnWidths={{ "0": "40px", "30px": "20px" }}
          onDragEnd={handleReorder}
          selectedRows={checkedRows}
          showFooter={false}
          showPagination={true}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>

      {/* Category Selection Tooltip */}
      <Tooltip
        id="category-more-tooltip"
        clickable
        style={{
          zIndex: 30,
          borderRadius: "12px",
          padding: "0",
        }}
        openOnClick
        noArrow
        border="none"
        opacity={1}
        render={() => (
          // <CategorySelectionTooltip
          //   groups={groups?.slice(3).map(group => ({ ...group, id: group.id.toString() })) || []}
          //   onCategorySelect={handleCategorySelect}
          //   onReorder={handleCategoryReorder}
          //   selectedCategoryId={selectedCategoryId}
          // />
          <></>
        )}
      />

      {/* More Actions Tooltips for each client */}
      {clients.map((_, index) => (
        <Tooltip
          key={`more-actions-${index}`}
          id={`more-actions-${index}`}
          clickable
          style={{
            zIndex: 30,
            borderRadius: "16px",
            padding: "0",
          }}
          place="left"
          openOnClick
          noArrow
          border="none"
          opacity={1}
          isOpen={activeTooltipId === `more-actions-${index}`}
          afterHide={() => setActiveTooltipId(null)}
          render={() => (
            <div className="tooltip-content">
              <MoreActionsTooltip
                onPay={() => handlePay(index)}
                onEdit={() => handleEdit(index)}
                onExport={() => handleExport(index)}
                onRemove={() => handleRemove(index)}
              />
            </div>
          )}
        />
      ))}

      {/* Multiple Contact Actions Tooltip */}
      <Tooltip
        id="multiple-actions-tooltip"
        clickable
        style={{
          zIndex: 30,
          borderRadius: "16px",
          padding: "0",
        }}
        place="left"
        openOnClick
        noArrow
        border="none"
        opacity={1}
        isOpen={showMultipleActions}
        afterHide={() => setShowMultipleActions(false)}
        render={() => (
          <div className="tooltip-content">
            <MultipleContactActionsTooltip
              addressCount={checkedRows.length}
              onExport={handleMultipleExport}
              onRemove={handleMultipleRemove}
            />
          </div>
        )}
      />
    </BaseContainer>
  );
};
