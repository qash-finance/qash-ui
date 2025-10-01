"use client";
import React from "react";
import { CategoryShape } from "@/types/address-book";

interface ShapeOption {
  value: CategoryShape;
  label: string;
}

interface ShapeSelectionTooltipProps {
  color: string;
  onShapeSelect: (shape: CategoryShape, shapeElement: React.ReactElement) => void;
}

export const createShapeElement = (shapeValue: CategoryShape, color: string): React.ReactElement => {
  switch (shapeValue) {
    case CategoryShape.CIRCLE:
      return <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />;
    case CategoryShape.DIAMOND:
      return <div className="w-4 h-4 rotate-45 rounded-sm" style={{ backgroundColor: color }} />;
    case CategoryShape.SQUARE:
      return <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: color }} />;
    case CategoryShape.TRIANGLE:
      return (
        <div
          className="w-0 h-0 border-l-[13px] border-r-[13px] border-b-[17px] border-l-transparent border-r-transparent"
          style={{ borderBottomColor: color }}
        />
      );
    default:
      return <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />;
  }
};

const shapeOptions: ShapeOption[] = [
  { value: CategoryShape.CIRCLE, label: "Circle" },
  { value: CategoryShape.DIAMOND, label: "Diamond" },
  { value: CategoryShape.SQUARE, label: "Square" },
  { value: CategoryShape.TRIANGLE, label: "Triangle" },
];

const ShapeSelectionTooltip: React.FC<ShapeSelectionTooltipProps> = ({ onShapeSelect, color = "#35ade9" }) => {
  return (
    <div className="bg-background rounded-2xl border border-primary-divider shadow-[0px_4px_6px_0px_rgba(0,0,0,0.08)]">
      <div className="flex items-start">
        {shapeOptions.map(shape => (
          <button
            key={shape.value}
            onClick={() => onShapeSelect(shape.value, createShapeElement(shape.value, color))}
            className="flex flex-col items-center p-2 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded group-hover:bg-app-background transition-colors cursor-pointer">
              {createShapeElement(shape.value, color)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeSelectionTooltip;
