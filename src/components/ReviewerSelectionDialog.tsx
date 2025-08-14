
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PeopleField, { Person } from './PeopleField';
import { DocumentRequest } from './DocumentRequestForm';

interface ReviewerSelectionDialogProps {
  document: DocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reviewers: Person[]) => void;
}

const ReviewerSelectionDialog: React.FC<ReviewerSelectionDialogProps> = ({ document, open, onOpenChange, onSubmit }: ReviewerSelectionDialogProps) => {
  const { toast } = useToast();
  const [reviewers, setReviewers] = useState<Person[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewers.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one reviewer",
        variant: "destructive",
      });
      return;
    }

    onSubmit(reviewers);
    setReviewers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Document Reviewers</DialogTitle>
          <DialogDescription>
            Choose who should review the document "{document.sopName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <PeopleField
            label="Reviewers"
            people={reviewers}
            onChange={setReviewers}
          />
          
          <DialogFooter>
            <Button type="submit">Send to Reviewers</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewerSelectionDialog;
