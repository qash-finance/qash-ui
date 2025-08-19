import React, { useState } from "react";
import { DayButton, DayPicker, DateRange, Chevron, MonthCaption, MonthGrid } from "react-day-picker";
import "react-day-picker/style.css";

interface DateFilterProps {
  defaultSelected?: DateRange;
  onSelect?: (date: Date | undefined) => void;
  onRangeChange?: (range: DateRange | undefined) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ defaultSelected, onSelect, onRangeChange }) => {
  const [selected, setSelected] = useState<DateRange | undefined>(defaultSelected);
  return (
    <DayPicker
      classNames={{
        month: "text-white",
        today: `text-[#1E8FFF]`,
        chevron: `fill-white`,
        caption_label: `text-[#DCDCDC] flex items-center justify-center`,
        range_middle: `bg-[#113355]`,
        range_end: `bg-[#113355] rounded-tr-full rounded-br-full`,
        range_start: `bg-[#113355] rounded-tl-full rounded-bl-full`,
      }}
      disabled={{ before: new Date(new Date().setDate(new Date().getDate() + 1)) }}
      animate
      styles={{
        root: {
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          backgroundColor: "#0C0C0C",
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
      selected={selected}
      onSelect={date => {
        setSelected(date);
        onSelect?.(date?.from);
        onRangeChange?.(date);
      }}
      components={{
        DayButton: props => {
          const { day, modifiers, ...buttonProps } = props;
          const dayDate = new Date(day.date);
          const isSelected =
            !!selected &&
            (selected.from?.toDateString() === dayDate.toDateString() ||
              selected.to?.toDateString() === dayDate.toDateString());

          // Check if day is in the middle of the range
          const isInRange =
            !!selected && selected.from && selected.to && dayDate > selected.from && dayDate < selected.to;

          const selectedStyle = isSelected
            ? {
                backgroundColor: "#1E8FFF",
                color: "white",
                borderRadius: "50%",
                border: "none",
                fontSize: "20px",
              }
            : isInRange
              ? {
                  color: "#989898",
                  border: "none",
                  fontSize: "20px",
                }
              : {};
          return <DayButton {...buttonProps} day={day} modifiers={modifiers} style={selectedStyle} />;
        },
        Chevron: props => {
          const { className, ...buttonProps } = props;
          return (
            <div className="flex items-center justify-center p-1 rounded-lg bg-[#3D3D3D]">
              <Chevron className={className} {...buttonProps} size={20} />
            </div>
          );
        },
        MonthCaption: props => {
          const { className, ...buttonProps } = props;
          return (
            <div className="flex items-center justify-center w-full bg-[#292929] rounded-lg">
              <MonthCaption className={className} {...buttonProps} />
            </div>
          );
        },
      }}
    />
  );
};

export default DateFilter;
