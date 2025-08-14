
import { useState } from 'react';
import { Person } from '@/components/PeopleField';
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { useToast } from '@/hooks/use-toast';

export const useReviewerSelection = (
  documentData?: DocumentRequest,
  onStatusChange?: () => void
) => {
  const [showReviewerSelectionDialog, setShowReviewerSelectionDialog] = useState(false);
  const { toast } = useToast();

  const handleReviewerSubmit = (reviewers: Person[]) => {
    if (!documentData) return;
    
    try {
      // Update document with reviewers and change status to 'under-review'
      if (onStatusChange) {
        // Notify the parent that status has changed
        onStatusChange();
      }
      
      toast({
        title: "Review Started",
        description: `"${documentData.sopName}" has been sent for review.`
      });
      
    } catch (error) {
      console.error('Error starting review process:', error);
      toast({
        title: "Error",
        description: "Could not start review process. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    showReviewerSelectionDialog,
    setShowReviewerSelectionDialog,
    handleReviewerSubmit
  };
};
