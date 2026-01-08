import React from "react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
}

export const CustomBlueCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
  id,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const checkboxElement = (
    <div className={`custom-blue-checkbox ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <input type="checkbox" id={id} checked={checked} onChange={handleChange} disabled={disabled} />
      <span className="blue-checkmark"></span>
    </div>
  );

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        {checkboxElement}
        <span className="text-white">{label}</span>
      </label>
    );
  }

  return checkboxElement;
};
