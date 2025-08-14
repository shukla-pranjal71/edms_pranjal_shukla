
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";

interface DocumentAttachmentTabProps {
  attachment: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBackTab: () => void;
  onSubmit: (event: React.FormEvent) => void;
  isSubmitting: boolean;
  isUploading: boolean;
}

const DocumentAttachmentTab: React.FC<DocumentAttachmentTabProps> = ({
  attachment,
  onFileChange,
  onBackTab,
  onSubmit,
  isSubmitting,
  isUploading
}) => {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <FileUp className="h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">Upload Document or Image</h3>
          
          <Input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={onFileChange} 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp" 
          />
          
          <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()} className="mt-2">
            Choose File
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            {attachment ? attachment.name : "No file chosen"}
          </p>
          
          <p className="text-xs text-gray-500 mt-3">
            Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, BMP, WEBP. Maximum size: 10MB
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBackTab}>
          Back to Details
        </Button>
        
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSubmitting || isUploading} 
          className="bg-[#ffa530]"
        >
          {isSubmitting || isUploading ? "Creating..." : "Create Document"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentAttachmentTab;
