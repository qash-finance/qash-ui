"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Tooltip } from "react-tooltip";
import { ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { ActionButton } from "../../Common/ActionButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { PrimaryButton } from "../../Common/PrimaryButton";
import ShapeSelectionTooltip, { createShapeElement } from "../../Common/ToolTip/ShapeSelectionTooltip";
import { CategoryShape } from "@/types/address-book";
import { useCreateCategory, useGetCategories } from "@/services/api/address-book";
import toast from "react-hot-toast";

interface CategoryFormData {
  name: string;
  shape: CategoryShape;
}

const colorOptions = [
  { value: "#35ADE9", label: "Blue" },
  { value: "#7D52F4", label: "Purple" },
  { value: "#E9358F", label: "Pink" },
  { value: "#E97135", label: "Orange" },
  { value: "#1DAF61", label: "Green" },
];

export function CreateCategoryModal({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShape, setSelectedShape] = useState(CategoryShape.CIRCLE);
  const [selectedShapeElement, setSelectedShapeElement] = useState<React.ReactElement | null>(null);
  const [selectedColor, setSelectedColor] = useState("#35ADE9");
  const { mutate: createCategory } = useCreateCategory();
  const { data: categories } = useGetCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      shape: CategoryShape.CIRCLE,
    },
  });

  const handleShapeSelect = (shape: CategoryShape, shapeElement: React.ReactElement) => {
    setSelectedShape(shape);
    setSelectedShapeElement(shapeElement);
    setValue("shape", shape);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Update shape element when color changes
  useEffect(() => {
    if (selectedShape) {
      // Create updated shape element with new color using shared utility
      // const updatedElement = createShapeElement(selectedShape, selectedColor);
      // setSelectedShapeElement(updatedElement);
    }
  }, [selectedColor, selectedShape]);

  // Check if category name already exists
  const currentName = watch("name");
  const categoryExists =
    currentName.length >= 2 && categories?.some(cat => cat.name.toLowerCase() === currentName.toLowerCase());

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      // Check if category name already exists
      if (categoryExists) {
        toast.error("Category name already exists");
        setIsLoading(false);
        return;
      }

      createCategory({
        name: data.name,
        shape: data.shape,
        color: selectedColor,
      });
      reset();
      setSelectedShape(CategoryShape.CIRCLE);
      setSelectedColor("#35ADE9");
      onClose();

      toast.success("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Create New Group" onClose={onClose} icon="/misc/category-icon.svg" />
      <div className="flex flex-col gap-4 p-4 border-2 border-primary-divider rounded-b-2xl bg-background w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Category Name Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-app-background border-b-2 border-primary-divider">
              <span className="text-text-secondary text-sm">Group Name</span>
              <input
                {...register("name", {
                  required: "Group name is required",
                  minLength: {
                    value: 2,
                    message: "Group name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Group name cannot exceed 50 characters",
                  },
                })}
                autoComplete="off"
                type="text"
                placeholder="Enter group name"
                className="w-full bg-transparent border-none outline-none text-text-primary text-base placeholder:text-text-secondary"
                autoFocus
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <div className="flex flex-row gap-1 items-center pl-2">
                <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                <span className="text-[#E93544] text-sm">{errors.name.message}</span>
              </div>
            )}
            {currentName.length >= 2 && categoryExists && (
              <div className="flex flex-row gap-1 items-center pl-2">
                <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
                <span className="text-[#E93544] text-sm">Category name already exists</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-5 items-center">
              <span className="text-text-secondary text-sm">Select icon</span>
              <span className="text-text-secondary text-sm">Select color</span>
            </div>

            <div className="flex flex-row gap-5 items-center">
              <div
                data-tooltip-id="shape-selection-tooltip"
                className="bg-app-background rounded-full px-2 py-1 flex flex-row items-center gap-1 w-fit justify-center border-b-2 border-primary-divider cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center">{selectedShapeElement}</div>

                <img
                  src="/arrow/filled-arrow-down.svg"
                  alt="Select shape"
                  className="w-3 h-3 mr-1"
                  style={{ filter: "brightness(0)" }}
                />
              </div>

              <div className="flex flex-row gap-2">
                {colorOptions.map(color => (
                  <button
                    type="button"
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor === color.value
                        ? "border-white outline-2"
                        : "border-primary-divider hover:border-white"
                    }`}
                    style={{
                      backgroundColor: color.value,
                      outlineColor: selectedColor === color.value ? color.value : "transparent",
                    }}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 mt-2">
            <SecondaryButton
              text="Cancel"
              onClick={onClose}
              buttonClassName="flex-1"
              disabled={isLoading}
              variant="light"
            />
            <PrimaryButton
              text="Create"
              onClick={handleSubmit(onSubmit)}
              containerClassName="flex-1"
              loading={isLoading}
              disabled={watch("name") === "" || categoryExists}
            />
          </div>
        </form>
      </div>

      {/* Shape Selection Tooltip */}
      <Tooltip
        id="shape-selection-tooltip"
        clickable
        style={{
          zIndex: 30,
          borderRadius: "16px",
          padding: "0",
        }}
        openOnClick
        noArrow
        border="none"
        opacity={1}
        // render={() => <ShapeSelectionTooltip color={selectedColor} onShapeSelect={handleShapeSelect} />}
      />
    </BaseModal>
  );
}

export default CreateCategoryModal;
