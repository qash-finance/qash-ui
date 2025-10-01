import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table } from "../Common/Table";
import { CategorySelectionTooltip } from "./CategorySelectionTooltip";
import { useGetCategories, useUpdateCategoryOrder, useGetAddressBooksByCategory } from "@/services/api/address-book";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { formatAddress } from "@/services/utils/miden/address";
import { CategoryShape } from "@/types/address-book";
import { createShapeElement } from "./ShapeSelectionTooltip";

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
  const { openModal } = useModal();
  const [tabs, setTabs] = useState<{ id: string; label: React.ReactNode }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: categories } = useGetCategories();
  const { mutate: updateCategoryOrder } = useUpdateCategoryOrder();
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);

  // Get address books based on active tab
  const getCategoryName = () => {
    if (activeTab === "all" || activeTab === "more") return "";
    const category = categories?.find(cat => cat.id.toString() === activeTab);
    return category?.name || "";
  };

  const { data: addressBooks, isLoading: isLoadingAddressBooks } = useGetAddressBooksByCategory(getCategoryName());

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
    console.log("🚀 ~ handleCategorySelect ~ categoryId:", categoryId);
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

  // Format address book data for table
  const tableHeaders = [
    <div className="flex justify-center items-center">
      <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
    </div>,
    "Name",
    "Address",
    "Email",
    "Token",
    "Category",
  ];
  const tableData =
    addressBooks?.map((contact, index) => ({
      "header-0": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />
        </div>
      ),
      Name: contact.name,
      Address: (
        <div className="flex justify-center items-center gap-2">
          {formatAddress(contact.address)} <img src="/misc/copy-icon.svg" alt="copy" className="w-4 h-4" />
        </div>
      ),
      Email: contact.email || "-",
      Token: "-",
      Category: (
        <div className="flex justify-center items-center">
          <CategoryBadge
            shape={
              selectedCategoryId
                ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.shape || CategoryShape.CIRCLE
                : CategoryShape.CIRCLE
            }
            color={
              selectedCategoryId
                ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.color || "#35ADE9"
                : "#35ADE9"
            }
            name={
              selectedCategoryId ? categories?.find(cat => cat.id.toString() === selectedCategoryId)?.name || "-" : "-"
            }
          />
        </div>
      ),
    })) || [];

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
        children={
          isLoadingAddressBooks ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Loading contacts...</div>
            </div>
          ) : (
            <div className="w-full h-full p-1">
              <Table data={tableData} headers={tableHeaders} draggable={true} />
            </div>
          )
        }
        containerClassName="w-full"
      />

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
    </div>
  );
};

export default ContactBookContainer;
