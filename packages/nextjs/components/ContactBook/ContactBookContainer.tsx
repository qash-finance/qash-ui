import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table, CellContent } from "../Common/Table";
import { CategorySelectionTooltip } from "./CategorySelectionTooltip";
import { MoreActionsTooltip } from "./MoreActionsTooltip";
import { MultipleContactActionsTooltip } from "./MultipleContactActionsTooltip";
import {
  useGetCategories,
  useUpdateCategoryOrder,
  useGetAddressBooksByCategory,
  useGetAllAddressBooks,
  useDeleteAddressBook,
  useUpdateAddressBookOrder,
} from "@/services/api/address-book";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { formatAddress } from "@/services/utils/miden/address";
import { CategoryShape } from "@/types/address-book";
import { createShapeElement } from "./ShapeSelectionTooltip";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { toast } from "react-hot-toast";

const CategoryTab = ({ label }: { label: React.ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 h-10">
      <img src="/misc/category-icon.svg" alt="category" className="w-5 h-5" />
      <span className="text-text-primary truncate">{label}</span>
    </div>
  );
};

const CategoryBadge = ({ shape, color, name }: { shape: CategoryShape; color: string; name: string }) => {
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

const ContactBookContainer = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const [tabs, setTabs] = useState<{ id: string; label: React.ReactNode }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: categories } = useGetCategories();
  const { mutate: updateCategoryOrder } = useUpdateCategoryOrder();
  const { mutate: deleteAddressBook, isPending: isDeleting } = useDeleteAddressBook();
  const { mutate: updateAddressBookOrder, isPending: isReordering } = useUpdateAddressBookOrder();
  const { data: allAddressBooks, isLoading: isLoadingAllAddressBooks } = useGetAllAddressBooks();
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [showMultipleActions, setShowMultipleActions] = useState<boolean>(false);

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

  const { data: categoryAddressBooks, isLoading: isLoadingCategoryAddressBooks } =
    useGetAddressBooksByCategory(getCategoryId());

  // Use appropriate data source based on active tab
  const addressBooks = activeTab === "all" ? allAddressBooks : categoryAddressBooks;
  const isLoadingAddressBooks = activeTab === "all" ? isLoadingAllAddressBooks : isLoadingCategoryAddressBooks;

  useEffect(() => {
    if (categories) {
      const visibleCategories = categories.slice(0, 3);
      const remainingCount = categories.length - 3;

      const categoryTabs = visibleCategories.map(category => ({
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
  }, [categories]);

  const handleCategorySelect = (category: { id: string | number; name: string; icon?: string }) => {
    const categoryId = category.id.toString();
    setSelectedCategoryId(categoryId);

    // Check if the selected category is in the "more" section (categories 4+)
    if (categories) {
      const visibleCategoryIds = categories.slice(0, 3).map(cat => cat.id.toString());

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

  const handleCategoryReorder = (reorderedCategories: { id: string | number; name: string; icon?: string }[]) => {
    if (!categories) return;

    // Store the original order before any modifications
    const originalCategories = [...categories];

    const firstThreeCategories = originalCategories.slice(0, 3);
    const allCategories = [...firstThreeCategories, ...reorderedCategories];

    // Extract category IDs in the new order
    const categoryIds = allCategories.map(cat => Number(cat.id));

    // Call the API to update the category order
    updateCategoryOrder(categoryIds, {
      onSuccess: () => {
        console.log("Category order updated successfully");
      },
      onError: error => {
        console.error("Failed to update category order:", error);
      },
    });
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

  const isAllChecked = addressBooks && addressBooks?.length > 0 && checkedRows.length === addressBooks?.length;

  // Tooltip action handlers
  const handlePay = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      // Navigate to move-crypto page with recipient data
      const params = new URLSearchParams();
      params.set("tab", "send");
      params.set("recipient", contact.address);
      params.set("name", contact.name);

      // If contact has a token, include it in the URL
      if (contact.token?.faucetId) {
        params.set("tokenAddress", contact.token.faucetId);
      }

      router.push(`/move-crypto?${params.toString()}`);
      setActiveTooltipId(null);
    }
  };

  const handleEdit = (contactIndex: number) => {
    const contact = addressBooks?.[contactIndex];
    if (contact) {
      // Find the category for this contact
      const category = categories?.find(cat => cat.id.toString() === selectedCategoryId);

      openModal(MODAL_IDS.EDIT_CONTACT, {
        contactData: {
          id: contact.id?.toString() || "",
          name: contact.name,
          address: contact.address,
          email: contact.email || "",
          category: category?.name || "",
          token: contact.token,
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
        contactAddress: contact.address,
        onRemove: () => {
          if (contact.id) {
            deleteAddressBook(
              { ids: [contact.id] },
              {
                onSuccess: () => {
                  toast.success("Contact deleted successfully");
                  setActiveTooltipId(null);
                },
                onError: error => {
                  console.error("Failed to delete contact:", error);
                  toast.error("Failed to delete contact");
                },
              },
            );
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
          deleteAddressBook(
            { ids: contactIds },
            {
              onSuccess: () => {
                toast.success(`${selectedContacts.length} contacts deleted successfully`);
                setCheckedRows([]);
                setShowMultipleActions(false);
              },
              onError: error => {
                console.error("Failed to delete contacts:", error);
                toast.error("Failed to delete contacts");
              },
            },
          );
        },
      });
    }
  };

  const handleReorder = (reorderedData: Record<string, CellContent>[]) => {
    if (!addressBooks) return;

    // Get the current category ID
    const currentCategoryId = getCategoryId();
    if (currentCategoryId === null) {
      toast.error("Cannot reorder contacts in 'All Categories' view");
      return;
    }

    // Extract the IDs in the new order by matching the Name field
    const entryIds = reorderedData
      .map(rowData => {
        const name = rowData.Name as string;
        const contact = addressBooks.find(contact => contact.name === name);
        return contact?.id;
      })
      .filter((id): id is number => id !== undefined);

    if (entryIds.length > 0) {
      updateAddressBookOrder(
        { categoryId: currentCategoryId, entryIds },
        {
          onSuccess: () => {
            toast.success("Contact order updated successfully");
          },
          onError: error => {
            console.error("Failed to update contact order:", error);
            toast.error("Failed to update contact order");
          },
        },
      );
    }
  };

  // Format address book data for table
  const tableHeaders = [
    <div className="flex justify-center items-center">
      <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
    </div>,
    "Name",
    "Wallet Address",
    "Email",
    "Token",
    "Category",
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
        "Wallet Address": (
          <div className="flex justify-center items-center gap-2">
            {formatAddress(contact.address)}{" "}
            <img
              src="/misc/copy-icon.svg"
              alt="copy"
              className="w-4 h-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(contact.address);
                toast.success("Copied to clipboard");
              }}
            />
          </div>
        ),
        Email: contact.email || "-",
        Token: (
          <div className="flex justify-center items-center">
            <div className="flex justify-center items-center bg-app-background rounded-full px-3 py-2 w-fit gap-2 border-b-2 border-primary-divider">
              <img
                src={
                  contact.token?.faucetId === QASH_TOKEN_ADDRESS
                    ? "/q3x-icon.png"
                    : blo(turnBechToHex(contact.token?.faucetId || ""))
                }
                alt="token"
                className="w-4 h-4"
              />
              <span className="text-text-primary text-sm leading-none">
                {contact.token?.metadata?.symbol || "Unknown"}
              </span>
            </div>
          </div>
        ),
        Category: (
          <div className="flex justify-center items-center">
            <CategoryBadge
              shape={
                activeTab === "all" && contact.categories
                  ? (contact.categories.shape as CategoryShape) || CategoryShape.CIRCLE
                  : selectedCategoryId && selectedCategoryId !== "all"
                    ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.shape || CategoryShape.CIRCLE
                    : CategoryShape.CIRCLE
              }
              color={
                activeTab === "all" && contact.categories
                  ? contact.categories.color || "#35ADE9"
                  : selectedCategoryId && selectedCategoryId !== "all"
                    ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.color || "#35ADE9"
                    : "#35ADE9"
              }
              name={
                activeTab === "all" && contact.categories
                  ? contact.categories.name
                  : selectedCategoryId && selectedCategoryId !== "all"
                    ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.name || "-"
                    : "-"
              }
            />
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
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-4 px-5">
        <Header />
      </div>
      <BaseContainer
        header={
          <div className="w-full flex flex-row items-center justify-between gap-2 px-6 py-4">
            <div className="flex flex-row items-center justify-center gap-2">
              <TabContainer
                tabs={[
                  {
                    id: "all",
                    label: <CategoryTab label="All Categories" />,
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
                onClick={() => openModal(MODAL_IDS.CREATE_CATEGORY)}
              >
                <img src="/misc/plus-icon.svg" alt="plus-icon" className="w-full" style={{ filter: "invert(1)" }} />
              </div>
            </div>
            <span className="text-text-primary">{addressBooks?.length || 0} contacts</span>
          </div>
        }
        containerClassName="w-full h-full"
      >
        <div className="w-full p-2 h-full">
          <Table
            data={tableData}
            headers={tableHeaders}
            draggable={activeTab !== "all"}
            columnWidths={{ "0": "40px", "3": "20px" }}
            onDragEnd={handleReorder}
            selectedRows={checkedRows}
            showFooter={false}
          />
        </div>
      </BaseContainer>

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
          <CategorySelectionTooltip
            categories={categories?.slice(3).map(cat => ({ ...cat, id: cat.id.toString() })) || []}
            onCategorySelect={handleCategorySelect}
            onReorder={handleCategoryReorder}
            selectedCategoryId={selectedCategoryId}
          />
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
    </div>
  );
};

export default ContactBookContainer;
