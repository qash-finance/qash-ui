"use client";
import React, { useState, useRef } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      onFileSelect?.(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      onFileSelect?.(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-[12px] p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
        dragActive ? "border-primary-blue bg-blue-50" : "border-primary-divider bg-base-container-sub-background"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,.ods,.tsv"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col gap-[2px] items-center text-center">
        <p className="font-barlow font-semibold text-[14px] text-text-primary leading-[20px]">
          Choose files or Drag & Drop it here.
        </p>
        <p className="font-barlow text-[12px] text-text-secondary leading-[16px]">
          Supported formats: .xlsx, .xls, .csv, .ods, .tsv
        </p>
      </div>

      <SecondaryButton text="Upload Files" onClick={handleClick} buttonClassName="w-[106px]" />
    </div>
  );
};
