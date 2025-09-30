import React, { useState } from "react";
import { DayButton, DayPicker, DateRange, Chevron, MonthCaption, MonthGrid } from "react-day-picker";
import "react-day-picker/style.css";

interface DateFilterProps {
  defaultSelected?: DateRange;
  onSelect?: (date: Date | undefined) => void;
  onRangeChange?: (range: DateRange | undefined) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ defaultSelected, onSelect, onRangeChange }) => {
  return (
    <DayPicker
      classNames={{
        month: "text-text-secondary",
        today: `text-[#1E8FFF]`,
        chevron: `fill-black`,
        caption_label: `text-text-primary font-medium flex items-center justify-center`,
        range_middle: `bg-[#BBDDFF]`,
        range_end: `bg-[#BBDDFF] rounded-tr-full rounded-br-full`,
        range_start: `bg-[#BBDDFF] rounded-tl-full rounded-bl-full`,
      }}
      disabled={{ after: new Date() }}
      animate
      styles={{
        root: {
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          borderRadius: "10px",
          fontSize: "18px",
          padding: "10px",
        },
        day: {
          justifyItems: "center",
        },
        month_grid: {
          width: "350px",
        },
      }}
      navLayout="around"
      mode="range"
      selected={defaultSelected}
      onSelect={date => {
        onSelect?.(date?.from);
        onRangeChange?.(date);
      }}
      components={{
        DayButton: props => {
          const { day, modifiers, ...buttonProps } = props;
          const dayDate = new Date(day.date);
          const isSelected =
            !!defaultSelected &&
            (defaultSelected.from?.toDateString() === dayDate.toDateString() ||
              defaultSelected.to?.toDateString() === dayDate.toDateString());

          // Check if day is in the middle of the range
          const isInRange =
            !!defaultSelected &&
            defaultSelected.from &&
            defaultSelected.to &&
            dayDate > defaultSelected.from &&
            dayDate < defaultSelected.to;

          const selectedStyle = isSelected
            ? {
                backgroundColor: "var(--primary-blue)",
                color: "white",
                borderRadius: "50%",
                border: "none",
                fontSize: "20px",
              }
            : isInRange
              ? {
                  color: "var(--text-secondary)",
                  border: "none",
                  fontSize: "20px",
                }
              : {};
          return <DayButton {...buttonProps} day={day} modifiers={modifiers} style={selectedStyle} />;
        },
        Chevron: props => {
          const { className, ...buttonProps } = props;
          return (
            <div className="flex items-center justify-center p-1 rounded-lg bg-background border-b-2 border-primary-divider">
              <Chevron className={className} {...buttonProps} size={20} />
            </div>
          );
        },
        MonthCaption: props => {
          const { className, ...buttonProps } = props;
          return (
            <div className="flex items-center justify-center w-full bg-app-background rounded-lg">
              <MonthCaption className={className} {...buttonProps} />
            </div>
          );
        },
      }}
    />
  );
};

export default DateFilter;
