"use client";
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: string | number;
  name: string;
  icon?: string;
}

interface CategorySelectionTooltipProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  onReorder?: (reorderedCategories: Category[]) => void;
  selectedCategoryId: string | null;
}

// Sortable Category Item Component
const SortableCategoryItem = ({
  category,
  isSelected,
  onSelect,
}: {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 p-2 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected ? "bg-[#f6f6f6]" : "hover:bg-[#f6f6f6]"
      } ${isDragging ? "z-50" : ""}`}
      onClick={() => onSelect(category)}
    >
      {/* Drag Handle */}
      <div
        className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing mr-1"
        {...attributes}
        {...listeners}
      >
        <img src="/misc/table-dnd-icon.svg" alt="Drag handle" className="w-3 h-3" />
      </div>

      {/* Category Icon */}
      <img src="/misc/category-icon.svg" alt="category" className="w-5 h-5" style={{ filter: "brightness(0)" }} />

      {/* Category Name */}
      <span className="text-sm font-medium text-text-primary truncate">{category.name}</span>
    </div>
  );
};

export const CategorySelectionTooltip = ({
  categories,
  onCategorySelect,
  onReorder,
  selectedCategoryId,
}: CategorySelectionTooltipProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(item => item.id.toString() === active.id);
      const newIndex = categories.findIndex(item => item.id.toString() === over?.id);

      const newItems = arrayMove(categories, oldIndex, newIndex);
      onReorder?.(newItems);
    }
  };

  return (
    <div className="bg-white rounded-xl p-2 shadow-lg border border-primary-divider w-[200px] flex flex-col gap-2">
      {/* Search Input */}
      <div className="bg-app-background rounded-lg p-2 border-2 border-primary-divider">
        <input
          type="text"
          placeholder="Search category"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
          autoFocus
        />
      </div>

      {/* Category List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={filteredCategories.map(cat => cat.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {filteredCategories.map(category => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id.toString()}
                onSelect={category => {
                  onCategorySelect(category);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredCategories.length === 0 && (
        <div className="px-2 py-3.5 text-sm text-[rgba(132,132,132,0.5)] text-center">No categories found</div>
      )}
    </div>
  );
};
