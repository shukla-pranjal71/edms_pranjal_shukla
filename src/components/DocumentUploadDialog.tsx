
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileService } from "@/services/fileService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { BaseDocumentRequest } from "./table/DocumentTableTypes";
import { documentService } from "@/services/documentService";
import { DocumentRequest } from "./DocumentRequestForm";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateComplete: (comments?: string) => void;
  document: BaseDocumentRequest;
}

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  onUpdateComplete,
  document,
}: DocumentUploadDialogProps) => {
  const [comments, setComments] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document or image file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload the file to local storage simulation
      const timestamp = new Date().getTime();
      const filePath = `${document.id}/${document.documentCode}-v${document.versionNumber}-${timestamp}-${file.name}`;
      const fileUrl = await FileService.uploadFile(file, filePath);
      
      // Update document with the file URL and ensure all required properties are present
      const updatedDocument: DocumentRequest = {
        ...document,
        fileUrl: fileUrl,
        comments: document.comments ? [...document.comments, comments] : [comments],
        lastRevisionDate: document.lastRevisionDate || new Date().toISOString().split('T')[0],
        nextRevisionDate: document.nextRevisionDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        documentOwners: document.documentOwners || [],
        reviewers: document.reviewers || [],
        documentCreators: document.documentCreators || [],
        complianceNames: document.complianceNames || [],
        documentType: document.documentType || 'SOP',
        complianceContacts: [],
        status: document.status as any // Type assertion to handle status compatibility
      };
      
      // Save document to hardcoded data
      await documentService.updateDocument(updatedDocument);
      
      // Show success toast
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded and saved to the database.",
        variant: "success"
      });
      
      // Update UI state
      setFile(null);
      setComments("");
      setFileError(null);
      
      // Call callback with comments
      onUpdateComplete(comments);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    setFileError(null);
    
    if (selectedFile) {
      // Validate file type (documents and images)
      if (!FileService.validateDocumentFile(selectedFile) && !FileService.validateImageFile(selectedFile)) {
        setFileError("Please select a PDF, DOC, DOCX file or an image (JPG, PNG, GIF, etc.).");
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setFileError("File size must be less than 10MB.");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Revised Document or Image</DialogTitle>
            <DialogDescription>
              Upload the revised version of "{document.sopName}" for processing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="file" className="block text-sm font-medium mb-2">
                Document or Image File
              </Label>
              <div className="space-y-2">
                <Input
                  id="file"
                  type="file"
                  className="col-span-3"
                  onChange={handleFileSelected}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                />
                {fileError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {fileError}
                  </div>
                )}
                {file && !fileError && (
                  <div className="text-sm text-gray-500">
                    {file.name} ({FileService.formatFileSize(file.size)})
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="comments" className="block text-sm font-medium mb-2">
                Comments (Optional)
              </Label>
              <Input
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="h-[120px]"
                placeholder="Add any comments about this revision..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUploading || !file || !!fileError}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
