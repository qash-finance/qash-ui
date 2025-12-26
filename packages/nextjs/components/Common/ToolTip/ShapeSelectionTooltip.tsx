"use client";
import React from "react";
import { CategoryShapeEnum } from "@/types/employee";

interface ShapeOption {
  value: CategoryShapeEnum;
  label: string;
}

interface ShapeSelectionTooltipProps {
  color: string;
  onShapeSelect: (shape: CategoryShapeEnum, shapeElement: React.ReactElement) => void;
}

export const createShapeElement = (shapeValue: CategoryShapeEnum, color: string): React.ReactElement => {
  switch (shapeValue) {
    case CategoryShapeEnum.CIRCLE:
      return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />;
    case CategoryShapeEnum.DIAMOND:
      return <div className="w-3 h-3 rotate-45 rounded-sm" style={{ backgroundColor: color }} />;
    case CategoryShapeEnum.SQUARE:
      return <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />;
    case CategoryShapeEnum.TRIANGLE:
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
  { value: CategoryShapeEnum.CIRCLE, label: "Circle" },
  { value: CategoryShapeEnum.DIAMOND, label: "Diamond" },
  { value: CategoryShapeEnum.SQUARE, label: "Square" },
  { value: CategoryShapeEnum.TRIANGLE, label: "Triangle" },
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
