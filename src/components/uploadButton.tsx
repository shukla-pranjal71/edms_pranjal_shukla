
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface UploadButtonProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  acceptImages?: boolean;
  acceptDocuments?: boolean;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onFileSelected,
  acceptedFileTypes,
  disabled = false,
  className = "",
  label = "Choose File",
  acceptImages = false,
  acceptDocuments = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const getAcceptedFileTypes = () => {
    if (acceptedFileTypes) return acceptedFileTypes;
    
    const imageTypes = ".jpg,.jpeg,.png,.gif,.bmp,.webp";
    const documentTypes = ".pdf,.doc,.docx";
    
    if (acceptImages && acceptDocuments) {
      return `${documentTypes},${imageTypes}`;
    } else if (acceptImages) {
      return imageTypes;
    } else {
      return documentTypes;
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptedFileTypes()}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`flex items-center ${className}`}
        variant="outline"
      >
        <Upload className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </>
  );
};
