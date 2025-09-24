"use client";
import React, { useState, useRef } from "react";
import { TransactionOverviewModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";
import BaseModal from "../BaseModal";
import { ModalHeader } from "@/components/Common/ModalHeader";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { PrimaryButton } from "@/components/Common/PrimaryButton";

interface ImportWalletModalProps {
  onImport?: (files: File[]) => void;
}

export function ImportWalletModal({
  isOpen,
  onClose,
  ...props
}: ModalProp<TransactionOverviewModalProps & ImportWalletModalProps>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear files when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsImporting(false);
      setImportProgress(0);
      setCurrentFile(null);
      setTimeRemaining(0);
      setIsDragOver(false);
    }
  }, [isOpen]);

  const handleFileSelection = (files: FileList | null, autoImport = false) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Limit to only 1 file
    if (fileArray.length > 1) {
      toast.error("Please select only 1 file at a time");
      return;
    }

    const validFiles = fileArray.filter(file => {
      const extension = file.name.toLowerCase().split(".").pop();
      return ["xlsx", "csv", "json"].includes(extension || "");
    });

    if (validFiles.length === 0) {
      toast.error("Please select a valid .json file");
      return;
    }

    setSelectedFiles(validFiles);

    // If autoImport is true (from drag & drop), start processing immediately
    if (autoImport) {
      handleImportFiles(validFiles);
    }
  };

  const handleImportFiles = async (files: File[]) => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file);

        const extension = file.name.toLowerCase().split(".").pop();

        // Simulate progress and time estimation
        const startTime = Date.now();
        const estimatedDuration = 1000; // 1 second

        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / estimatedDuration) * 100, 95);
          const remaining = Math.max(Math.ceil((estimatedDuration - elapsed) / 1000), 0);

          setImportProgress(progress);
          setTimeRemaining(remaining);

          if (progress >= 95) {
            clearInterval(progressInterval);
          }
        }, 100);

        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, estimatedDuration));

        // Complete the progress
        clearInterval(progressInterval);
        setImportProgress(100);
        setTimeRemaining(0);

        // Wait a moment to show completion
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // File processing complete - now user can click Import button
      toast.success("File processed successfully! Click Import to proceed.");
    } catch (error) {
      toast.error("Failed to process files.");
      console.error("File processing error:", error);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setCurrentFile(null);
      setTimeRemaining(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files, true); // Auto-import on drag & drop
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file to import");
      return;
    }

    // Pass the selected files to the parent component (ConnectWalletModal)
    if (props.onImport) {
      props.onImport(selectedFiles);
    }

    // Close the modal and let ConnectWalletModal handle the actual import process
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Import Your Wallet" onClose={onClose} icon="/modal/blue-wallet-icon.gif" />
      <div className="flex flex-col gap-6 p-4 bg-background rounded-b-2xl w-[600px] border-2 border-primary-divider">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-200 ${
            isDragOver ? "border-blue-500 bg-blue-500/10 border-solid" : "border-primary-divider bg-app-background"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* File Icon with Glow Effect */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary-blue blur-xl animate-pulse"></div>
              <div className="relative rounded-full p-2">
                <img src="/connect-wallet/choose-file-import.svg" alt="" className="scale-125" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-medium text-text-primary">Choose file or Drag & Drop it here.</h3>
          <p className="text-text-secondary mb-3">Only support .json (1 file only)</p>

          <SecondaryButton
            text="Upload File"
            onClick={handleUploadClick}
            variant="dark"
            buttonClassName="mx-auto w-[150px] h-[40px]"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.json"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Tooltip */}
        <div className="bg-[#D3F0FF] rounded-2xl p-4">
          <div className="flex gap-3 items-center">
            <div className="flex-shrink-0 mt-0.5">
              <img src="/connect-wallet/warning.svg" alt="" className="w-6 h-6" />
            </div>
            <p className="text-sm text-[#35ADE9] leading-5">
              Be aware that importing account will replace all your existing accounts!
            </p>
          </div>
        </div>

        {/* Progress File Item (shown during import) */}
        {isImporting && currentFile && (
          <div className="flex items-center gap-4 p-4 bg-[#2A2A2A] rounded-2xl">
            {/* File Icon */}
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14,2 14,8 20,8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* File Details and Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-medium text-lg">{currentFile.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{formatFileSize(currentFile.size)}</span>
                    <span>•</span>
                    <span>{timeRemaining > 0 ? `${timeRemaining} sec left` : "Complete"}</span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <span className="text-white text-sm min-w-[40px]">{Math.round(importProgress)}%</span>
              </div>
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && !isImporting && (
          <>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="text-sm text-text-primary bg-background border-1 border-primary-divider rounded px-2 py-1 mb-1"
              >
                {file.name}
              </div>
            ))}
          </>
        )}

        {/* Action Buttons (only shown when not importing) */}
        {!isImporting && (
          <div className="flex gap-2 w-full">
            <SecondaryButton text="Cancel" variant="light" onClick={onClose} buttonClassName="flex-1" />
            <PrimaryButton
              text="Submit"
              onClick={handleImport}
              containerClassName="flex-1"
              disabled={selectedFiles.length === 0}
            />
          </div>
        )}
      </div>
    </BaseModal>
  );
}

export default ImportWalletModal;
