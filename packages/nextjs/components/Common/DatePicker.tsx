import React, { useState } from "react";
import { DayButton, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface DatePickerProps {
  defaultSelected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ defaultSelected, onSelect }) => {
  const [selected, setSelected] = useState<Date | undefined>(defaultSelected);
  return (
    <DayPicker
      classNames={{
        month: "text-white",
        today: `text-[#1E8FFF]`,
        chevron: `fill-[#1E8FFF]`,
        caption_label: `text-white flex items-center justify-center [&>svg]:rotate-270`,
      }}
      disabled={{ before: new Date(new Date().setDate(new Date().getDate() + 1)) }}
      animate
      styles={{
        root: {
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          backgroundColor: "#292929",
          borderRadius: "10px",
          fontSize: "18px",
        },
        day: {
          justifyItems: "center",
          backgroundColor: "none",
        },
        weekday: {
          width: "65px",
          justifyItems: "center",
        },
        month_caption: {
          marginLeft: "20px",
        },
      }}
      mode="single"
      selected={selected}
      onSelect={date => {
        setSelected(date);
        onSelect?.(date);
      }}
      captionLayout="dropdown-years"
      components={{
        DayButton: props => {
          const { day, modifiers, ...buttonProps } = props;
          const dayDate = new Date(day.date);
          const isSelected = !!selected && selected.toDateString() === dayDate.toDateString();
          const selectedStyle = isSelected
            ? {
                backgroundColor: "#283543",
                color: "#1E8FFF",
                borderRadius: "50%",
                border: "none",
                fontSize: "20px",
              }
            : {};
          return <DayButton {...buttonProps} day={day} modifiers={modifiers} style={selectedStyle} />;
        },
      }}
    />
  );
};

export default DatePicker;
