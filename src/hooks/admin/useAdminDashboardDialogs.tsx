
import { useState } from 'react';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

export const useAdminDashboardDialogs = () => {
  const [selectedDocument, setSelectedDocument] = useState<BaseDocumentRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showConfirmArchiveDialog, setShowConfirmArchiveDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  
  return {
    selectedDocument,
    setSelectedDocument,
    showDetailsDialog,
    setShowDetailsDialog,
    showNotificationDialog,
    setShowNotificationDialog,
    showConfirmArchiveDialog,
    setShowConfirmArchiveDialog,
    showConfirmDeleteDialog,
    setShowConfirmDeleteDialog,
  };
};
