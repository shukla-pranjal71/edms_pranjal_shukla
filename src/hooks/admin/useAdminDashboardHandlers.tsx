
import { useState } from 'react';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

export const useAdminDashboardHandlers = (
  documents: any[],
  setDocuments: React.Dispatch<React.SetStateAction<any[]>>,
  selectedDocument: BaseDocumentRequest | null,
  setSelectedDocument: React.Dispatch<React.SetStateAction<BaseDocumentRequest | null>>,
  setShowDetailsDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setShowNotificationDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setShowConfirmArchiveDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setShowConfirmDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>,
  activeTab: string,
  filteredDocuments: any[],
  setSelectedStatus: React.Dispatch<React.SetStateAction<string | null>>,
  selectedStatus: string | null
) => {
  
  // View document details
  const handleViewDocument = (document: BaseDocumentRequest) => {
    setSelectedDocument(document);
    setShowDetailsDialog(true);
  };

  // Toggle filter by status
  const handleStatusFilterClick = (status: string | null) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
      return null;
    } else {
      setSelectedStatus(status);
      return status;
    }
  };

  // Download document
  const handleDownload = (document: BaseDocumentRequest) => {
    console.log(`Download started for ${document.sopName}`);
  };

  // Send notification
  const handlePushNotification = (document: BaseDocumentRequest) => {
    setSelectedDocument(document);
    setShowNotificationDialog(true);
  };

  // Send notification to users with specific role
  const handleSendNotification = (role: string) => {
    console.log(`Notification sent to users with ${role} role.`);
    setShowNotificationDialog(false);
  };

  // Archive document
  const handleArchiveDocument = (document: BaseDocumentRequest) => {
    setSelectedDocument(document);
    setShowConfirmArchiveDialog(true);
  };

  // Confirm archive
  const confirmArchive = () => {
    if (selectedDocument) {
      const updatedDocuments = documents.map(doc =>
        doc.id === selectedDocument.id ? { ...doc, status: 'archived' } : doc
      );
      setDocuments(updatedDocuments);
      console.log(`${selectedDocument.sopName} has been archived.`);
      setShowConfirmArchiveDialog(false);
    }
  };

  // Delete document
  const handleDeleteDocument = (document: BaseDocumentRequest) => {
    setSelectedDocument(document);
    setShowConfirmDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedDocument) {
      const updatedDocuments = documents.map(doc =>
        doc.id === selectedDocument.id ? { ...doc, status: 'deleted' } : doc
      );
      setDocuments(updatedDocuments);
      console.log(`${selectedDocument.sopName} has been deleted.`);
      setShowConfirmDeleteDialog(false);
    }
  };

  // Restore document
  const handleRestoreDocument = (document: BaseDocumentRequest) => {
    const originalStatus = document.status === 'deleted' ? 'draft' : 'live';
    const updatedDocuments = documents.map(doc =>
      doc.id === document.id ? { ...doc, status: originalStatus } : doc
    );
    setDocuments(updatedDocuments);
    console.log(`${document.sopName} has been restored.`);
  };

  // Logout
  const handleLogout = () => {
    console.log("User logged out.");
  };

  // Export documents
  const handleExportDocuments = () => {
    const docsToExport = activeTab === 'archived' 
      ? documents.filter(d => d.status === 'archived')
      : activeTab === 'deleted'
        ? documents.filter(d => d.status === 'deleted')
        : filteredDocuments;
    
    console.log(`Exporting ${docsToExport.length} documents...`);
  };

  return {
    handleViewDocument,
    handleStatusFilterClick,
    handleDownload,
    handlePushNotification,
    handleSendNotification,
    handleArchiveDocument,
    confirmArchive,
    handleDeleteDocument,
    confirmDelete,
    handleRestoreDocument,
    handleLogout,
    handleExportDocuments
  };
};
