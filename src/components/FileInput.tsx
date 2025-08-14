
import React from 'react';
import { Input } from "@/components/ui/input";

interface FileInputProps {
  onFileChange: (file: File | null) => void;
  acceptImages?: boolean;
  acceptDocuments?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({ 
  onFileChange, 
  acceptImages = false, 
  acceptDocuments = true 
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const getAcceptedFileTypes = () => {
    const imageTypes = ".jpg,.jpeg,.png,.gif,.bmp,.webp";
    const documentTypes = ".pdf,.doc,.docx,.txt";
    
    if (acceptImages && acceptDocuments) {
      return `${documentTypes},${imageTypes}`;
    } else if (acceptImages) {
      return imageTypes;
    } else {
      return documentTypes;
    }
  };

  return (
    <Input
      type="file"
      onChange={handleFileChange}
      accept={getAcceptedFileTypes()}
      className="cursor-pointer"
    />
  );
};
