
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentRequest } from './DocumentRequestForm';

interface ReviewPromptDialogProps {
  document?: DocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  onSubmit?: () => void; // Added this prop
}

const ReviewPromptDialog = ({ 
  document, 
  open, 
  onOpenChange, 
  onConfirm,
  onSubmit 
}: ReviewPromptDialogProps) => {
  
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onSubmit) onSubmit(); // Support both callback styles
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Document</DialogTitle>
          <DialogDescription>
            {document ? 
              `Are you sure you want to review "${document.sopName}"?` : 
              "Are you sure you want to submit this review?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
          >
            {document ? "Start Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPromptDialog;
