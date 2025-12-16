"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Category, CategoryShape } from "@/types/address-book";
import { createShapeElement } from "../ToolTip/ShapeSelectionTooltip";

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (category: Category) => void;
  disabled?: boolean;
}

export const CategoryDropdown = ({
  categories,
  selectedCategory,
  onCategorySelect,
  disabled = false,
}: CategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-full w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between"
        disabled={disabled}
      >
        <div className="flex flex-col">
          <span className="text-text-secondary text-sm">Select group</span>
          <p className="text-text-primary font-semibold">{selectedCategory || "Select a group"}</p>
        </div>
        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-5 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 overflow-hidden p-2 h-[240px] overflow-y-auto">
          <div className="px-2 py-1">
            <p className="text-text-secondary text-xs">Select a group</p>
          </div>

          <div className="flex flex-col">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer ${
                  selectedCategory === category.name ? "bg-app-background" : ""
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {/* {createShapeElement(category.shape, category.color)} */}
                </div>
                <span className="text-text-primary font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
