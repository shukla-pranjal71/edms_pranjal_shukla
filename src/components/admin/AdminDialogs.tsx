
import React from 'react';
import ViewDetailsDialog from '@/components/ViewDetailsDialog';
import SendNotificationDialog from '@/components/SendNotificationDialog';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

interface AdminDialogsProps {
  selectedDocument: BaseDocumentRequest | null;
  showDetailsDialog: boolean;
  setShowDetailsDialog: (show: boolean) => void;
  showNotificationDialog: boolean;
  setShowNotificationDialog: (show: boolean) => void;
  showConfirmArchiveDialog: boolean;
  setShowConfirmArchiveDialog: (show: boolean) => void;
  showConfirmDeleteDialog: boolean;
  setShowConfirmDeleteDialog: (show: boolean) => void;
  handleSendNotification: (role: string) => void;
  confirmArchive: () => void;
  confirmDelete: () => void;
}

export const AdminDialogs: React.FC<AdminDialogsProps> = ({
  selectedDocument,
  showDetailsDialog,
  setShowDetailsDialog,
  showNotificationDialog,
  setShowNotificationDialog,
  showConfirmArchiveDialog,
  setShowConfirmArchiveDialog,
  showConfirmDeleteDialog,
  setShowConfirmDeleteDialog,
  handleSendNotification,
  confirmArchive,
  confirmDelete,
}) => {
  if (!selectedDocument) return null;
  
  return (
    <>
      <ViewDetailsDialog 
        open={showDetailsDialog} 
        onOpenChange={setShowDetailsDialog} 
        document={selectedDocument} 
      />
      
      <SendNotificationDialog 
        open={showNotificationDialog} 
        onOpenChange={setShowNotificationDialog} 
        document={selectedDocument} 
        onSendNotification={handleSendNotification} 
      />
      
      <ConfirmActionDialog 
        open={showConfirmArchiveDialog} 
        onOpenChange={setShowConfirmArchiveDialog} 
        onConfirm={confirmArchive} 
        title="Archive Document" 
        description={`Are you sure you want to archive "${selectedDocument.sopName}"?`} 
        actionLabel="Archive" 
      />
      
      <ConfirmActionDialog 
        open={showConfirmDeleteDialog} 
        onOpenChange={setShowConfirmDeleteDialog} 
        onConfirm={confirmDelete} 
        title="Delete Document" 
        description={`Are you sure you want to delete "${selectedDocument.sopName}"?`} 
        actionLabel="Delete" 
      />
    </>
  );
};
