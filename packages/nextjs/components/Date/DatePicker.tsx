import React, { useState } from "react";
import { DayButton, DayPicker, Chevron, MonthCaption } from "react-day-picker";
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
        month: "text-text-secondary",
        today: `!text-[#1E8FFF] relative`,
        chevron: `fill-black`,
        caption_label: `text-text-primary font-medium flex items-center justify-center`,
      }}
      disabled={{ before: new Date(new Date().setDate(new Date().getDate() + 1)) }}
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
      mode="single"
      selected={selected}
      onSelect={date => {
        if (date) {
          // Set time to start of day (00:00:00.000)
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          setSelected(startOfDay);
          onSelect?.(startOfDay);
        } else {
          setSelected(undefined);
          onSelect?.(undefined);
        }
      }}
      components={{
        DayButton: props => {
          const { day, modifiers, ...buttonProps } = props;
          const dayDate = new Date(day.date);
          const isSelected = !!selected && selected.toDateString() === dayDate.toDateString();
          const isToday = modifiers.today;
          const selectedStyle = isSelected
            ? {
                backgroundColor: "var(--primary-blue)",
                color: "white",
                borderRadius: "50%",
                border: "none",
                fontSize: "20px",
              }
            : {
                color: "var(--text-primary)",
              };
          const containerStyle = isToday ? { position: "relative" as const } : {};
          return (
            <div style={containerStyle}>
              <DayButton {...buttonProps} day={day} modifiers={modifiers} style={selectedStyle} />
              {isToday && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                    margin: "0 auto",
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </div>
          );
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

export default DatePicker;
