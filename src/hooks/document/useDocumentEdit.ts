
import { useState } from 'react';
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { useToast } from '@/hooks/use-toast';

export const useDocumentEdit = (
  onEditDocument?: (updatedDoc: DocumentRequest) => void
) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const handleEditDocument = (updatedDoc: DocumentRequest) => {
    if (onEditDocument) {
      onEditDocument(updatedDoc);
    }
    setShowEditDialog(false);
    
    toast({
      title: "Document Updated",
      description: `Document has been updated successfully.`
    });
  };

  return {
    showEditDialog,
    setShowEditDialog,
    handleEditDocument
  };
};
