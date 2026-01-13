import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/navigation";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table } from "../Common/Table";
import { MoreActionsTooltip } from "../Common/ToolTip/MoreActionsTooltip";
import { MultipleContactActionsTooltip } from "../Common/ToolTip/MultipleContactActionsTooltip";
import {
  useGetAllEmployeeGroups,
  useGetEmployeesByGroup,
  useGetAllEmployees,
  useBulkDeleteEmployees,
} from "@/services/api/employee";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { formatAddress } from "@/services/utils/miden/address";
import { CategoryShapeEnum } from "@/types/employee";
import { createShapeElement } from "../Common/ToolTip/ShapeSelectionTooltip";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { toast } from "react-hot-toast";
import { useAuth } from "@/services/auth/context";
import { CategoryTab } from "./ContactBookContainer";

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
      className={`flex flex-row items-center justify-center gap-3 px-5 py-1 rounded-full border w-fit`}
      style={{ borderColor: color, backgroundColor: `${color}20` }}
    >
      {createShapeElement(shape, color)}
      <span className="font-semibold truncate" style={{ color: color }}>
        {name}
      </span>
    </div>
  );
};

export const EmployeeContact = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const [tabs, setTabs] = useState<{ id: string; label: React.ReactNode }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: groups } = useGetAllEmployeeGroups();
  const { mutate: deleteEmployees } = useBulkDeleteEmployees();
  const { data: allAddressBooksData, isLoading: isLoadingAllAddressBooks } = useGetAllEmployees(1, 1000, {
    enabled: isAuthenticated,
  });
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [showMultipleActions, setShowMultipleActions] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  // Get address books based on active tab
  const getCategoryId = () => {
    if (activeTab === "all" || activeTab === "more") return null;
    return Number(activeTab);
  };

  const { data: categoryAddressBooksData, isLoading: isLoadingCategoryAddressBooks } = useGetEmployeesByGroup(
    getCategoryId() || 0,
    1,
    1000,
  );

  // Use appropriate data source based on active tab
  const addressBooks = activeTab === "all" ? allAddressBooksData?.data : categoryAddressBooksData?.data;
  const isLoadingAddressBooks = activeTab === "all" ? isLoadingAllAddressBooks : isLoadingCategoryAddressBooks;

  useEffect(() => {
    if (groups) {
      const visiblegroups = groups.slice(0, 3);
      const remainingCount = groups.length - 3;

      const categoryTabs = visiblegroups.map(category => ({
        id: category.id.toString(),
        label: <CategoryTab label={category.name} />,
      }));

      if (remainingCount > 0) {
        categoryTabs.push({
          id: "more",
          label: (
            <div
              data-tooltip-id="category-more-tooltip"
              className="flex flex-row items-center justify-center gap-2 h-10 cursor-pointer"
            >
              <img src="/misc/category-icon.svg" alt="category" className="w-5 h-5" />
              <span className="text-text-primary truncate">{remainingCount} more...</span>
            </div>
          ),
        });
      }

      setTabs(categoryTabs);
    }
  }, [groups]);

  const handleCategorySelect = (category: { id: string | number; name: string; icon?: string }) => {
    const categoryId = category.id.toString();
    setSelectedCategoryId(categoryId);

    // Check if the selected category is in the "more" section (groups 4+)
    if (groups) {
      const visibleCategoryIds = groups.slice(0, 3).map(cat => cat.id.toString());

      // If the category is not in the first 3 visible tabs, set active tab to "more"
      if (!visibleCategoryIds.includes(categoryId)) {
        setActiveTab("more");
      } else {
        setActiveTab(categoryId);
      }
    } else {
      setActiveTab(categoryId);
    }
  };

  const handleCategoryReorder = (reorderedgroups: { id: string | number; name: string; icon?: string }[]) => {
    if (!groups) return;

    // Store the original order before any modifications
    const originalgroups = [...groups];

    const firstThreegroups = originalgroups.slice(0, 3);
    const allgroups = [...firstThreegroups, ...reorderedgroups];

    // Extract category IDs in the new order
    const categoryIds = allgroups.map(cat => Number(cat.id));

    // Call the API to update the category order
    // updateCategoryOrder(categoryIds, {
    //   onSuccess: () => {
    //     console.log("Category order updated successfully");
    //   },
    //   onError: error => {
    //     console.error("Failed to update category order:", error);
    //   },
    // });
  };

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    if (checkedRows.length === (addressBooks?.length || 0)) {
      setCheckedRows([]);
    } else {
      setCheckedRows(addressBooks?.map((_, idx) => idx) || []);
    }
  };

  const isAllChecked = !!(addressBooks && addressBooks.length > 0 && checkedRows.length === addressBooks.length);

  // Tooltip action handlers
  const handlePay = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      // Navigate to move-crypto page with recipient data
      const params = new URLSearchParams();
      params.set("tab", "send");
      params.set("recipient", contact.walletAddress);
      params.set("name", contact.name);

      // If contact has a token, include it in the URL
      if (contact.token?.address) {
        params.set("tokenAddress", contact.token.address);
      }

      router.push(`/move-crypto?${params.toString()}`);
      setActiveTooltipId(null);
    }
  };

  const handleEdit = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      // Find the group for this contact
      const group = groups?.find(cat => cat.id === contact.groupId);

      openModal(MODAL_IDS.EDIT_EMPLOYEE_CONTACT, {
        contactData: {
          id: contact.id?.toString() || "",
          name: contact.name,
          address: contact.walletAddress,
          email: contact.email || "",
          group: group?.name || "",
          token: contact.token,
          network: contact.network,
        },
      });
      setActiveTooltipId(null);
    }
  };

  const handleExport = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      console.log("Export contact:", contact);
      // TODO: Implement export functionality
      setActiveTooltipId(null);
    }
  };

  const handleRemove = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      openModal(MODAL_IDS.REMOVE_CONTACT_CONFIRMATION, {
        contactName: contact.name,
        contactAddress: contact.walletAddress,
        onRemove: () => {
          if (contact.id) {
            deleteEmployees([contact.id], {
              onSuccess: () => {
                toast.success("Contact deleted successfully");
                setActiveTooltipId(null);
              },
              onError: error => {
                console.error("Failed to delete contact:", error);
                toast.error("Failed to delete contact");
              },
            });
          }
        },
      });
    }
  };

  // Multiple contact action handlers
  const handleMultipleExport = () => {
    const selectedContacts = checkedRows.map(index => addressBooks?.[index]).filter(Boolean);
    console.log("Export multiple contacts:", selectedContacts);
    // TODO: Implement multiple export functionality
    setShowMultipleActions(false);
  };

  const handleMultipleRemove = () => {
    const selectedContacts = checkedRows.map(index => addressBooks?.[index]).filter(Boolean);
    if (selectedContacts.length > 0) {
      const contactIds = selectedContacts.map(contact => contact?.id).filter(Boolean) as number[];

      openModal(MODAL_IDS.REMOVE_CONTACT_CONFIRMATION, {
        contactName: `${selectedContacts.length} contacts`,
        contactAddress: "",
        onRemove: () => {
          deleteEmployees(contactIds, {
            onSuccess: () => {
              toast.success(`${selectedContacts.length} contacts deleted successfully`);
              setCheckedRows([]);
              setShowMultipleActions(false);
            },
            onError: error => {
              console.error("Failed to delete contacts:", error);
              toast.error("Failed to delete contacts");
            },
          });
        },
      });
    }
  };

// Format address book data for table
  const tableHeaders = [
    <div className="flex justify-center items-center">
      <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
    </div>,
    "Name",
    "Email",
    "Group",
    "Wallet Address",
    "Token",
    " ",
  ];

  const tableData =
    addressBooks?.map((contact, index) => {
      return {
        "header-0": (
          <div className="flex justify-center items-center">
            <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />
          </div>
        ),
        Name: contact.name,
        Email: contact.email || "-",
        Group: (
          <div className="flex justify-center items-center">
            <CategoryBadge
              shape={groups?.find(cat => cat.id === contact.groupId)?.shape || CategoryShapeEnum.CIRCLE}
              color={groups?.find(cat => cat.id === contact.groupId)?.color || "#35ADE9"}
              name={groups?.find(cat => cat.id === contact.groupId)?.name || "-"}
            />
          </div>
        ),
        "Wallet Address": (
          <div className="flex justify-center items-center gap-2">
            {formatAddress(contact.walletAddress)}{" "}
            <img
              src="/misc/copy-icon.svg"
              alt="copy"
              className="w-4 h-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(contact.walletAddress);
                toast.success("Copied to clipboard");
              }}
            />
          </div>
        ),
        Token: (
          <div className="flex justify-center items-center">
            <div className="flex justify-center items-center bg-app-background rounded-full px-3 py-2 w-fit gap-2 border-b-2 border-primary-divider">
              <img
                src={
                  contact.token?.address === QASH_TOKEN_ADDRESS
                    ? "/q3x-icon.png"
                    : blo(turnBechToHex(contact.token?.address || ""))
                }
                alt="token"
                className="w-4 h-4"
              />
              <span className="text-text-primary text-sm leading-none">{contact.token?.symbol || "Unknown"}</span>
            </div>
          </div>
        ),
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
    }) || [];

  return (
    <BaseContainer
      header={
        <div className="w-full flex flex-row items-center justify-between gap-2 px-6 py-4">
          <div className="flex flex-row items-center justify-center gap-2">
            <TabContainer
              tabs={[
                {
                  id: "all",
                  label: <CategoryTab label="All groups" />,
                },
                ...tabs,
              ]}
              activeTab={activeTab}
              setActiveTab={tab => {
                setActiveTab(tab);
                setSelectedCategoryId(tab);
                setCheckedRows([]); // Clear checked rows when switching tabs
              }}
            />
            <div
              className="flex flex-row items-center justify-center gap-2 cursor-pointer bg-background rounded-lg p-1.5"
              onClick={() => openModal(MODAL_IDS.CREATE_GROUP)}
            >
              <img src="/misc/plus-icon.svg" alt="plus-icon" className="w-full" style={{ filter: "invert(1)" }} />
            </div>
          </div>
          <span className="text-text-primary">{addressBooks?.length || 0} contacts</span>
        </div>
      }
      containerClassName="w-full h-full"
    >
      <div className="w-full p-5 h-full">
        <Table
          data={tableData}
          headers={tableHeaders}
          columnWidths={{ "0": "40px", "3": "20px" }}
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

      {/* More Actions Tooltips for each contact */}
      {addressBooks?.map((_, index) => (
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
