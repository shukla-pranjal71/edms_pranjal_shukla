
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

interface DocumentReviewerSelectionDialogProps {
  document: DocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (requesters: Person[], creators: Person[]) => void;
}

const DocumentReviewerSelectionDialog: React.FC<DocumentReviewerSelectionDialogProps> = ({ 
  document, 
  open, 
  onOpenChange, 
  onSubmit 
}: DocumentReviewerSelectionDialogProps) => {
  const { toast } = useToast();
  const [requesters, setRequesters] = useState<Person[]>([]);
  const [creators, setCreators] = useState<Person[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requesters.length === 0 && creators.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one document requester or creator",
        variant: "destructive",
      });
      return;
    }

    onSubmit(requesters, creators);
    setRequesters([]);
    setCreators([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Document Reviewers</DialogTitle>
          <DialogDescription>
            Assign Document Requesters and Creators for "{document.sopName}"
          </DialogDescription>
        </DialogHeader>
        
        {/* Document Details Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Document Code:</span>
              <p className="text-gray-900 dark:text-gray-100">{document.documentCode || 'DOC-' + Date.now().toString().slice(-6)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Version:</span>
              <p className="text-gray-900 dark:text-gray-100">{document.versionNumber || '1.0'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Department:</span>
              <p className="text-gray-900 dark:text-gray-100">{document.department || 'General'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Country:</span>
              <p className="text-gray-900 dark:text-gray-100">{document.country || 'Global'}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <PeopleField
            label="Document Requesters"
            people={requesters}
            onChange={setRequesters}
          />
          
          <PeopleField
            label="Document Creators"
            people={creators}
            onChange={setCreators}
          />
          
          <DialogFooter>
            <Button type="submit">Assign for Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentReviewerSelectionDialog;
