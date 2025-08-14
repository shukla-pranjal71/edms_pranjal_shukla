
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileService } from "@/services/fileService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReviewUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  documentId: string;
  onUploadComplete: () => void;
}

const ReviewUploadDialog = ({
  open,
  onOpenChange,
  documentName,
  documentId,
  onUploadComplete,
}: ReviewUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Generate a timestamp to ensure unique filenames
      const timestamp = new Date().getTime();
      const filePath = `reviews/${documentId}/${timestamp}-${file.name}`;
      const url = await FileService.uploadFile(file, filePath);
      
      // Set the file URL for later use
      setFileUrl(url);
      setUploadComplete(true);
      
      toast({
        title: "File uploaded",
        description: "Your review document has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await uploadFile(file);
    } else {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    onUploadComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Review Document</DialogTitle>
          <DialogDescription>
            Upload the reviewed version of "{documentName}" for approval.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              className="col-span-3"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!uploadComplete ? (
            <Button type="button" onClick={handleUpload} disabled={isUploading || !file}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          ) : (
            <Button type="button" onClick={handleComplete}>
              Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewUploadDialog;
