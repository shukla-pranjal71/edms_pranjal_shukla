
import { useState } from 'react';
import { BaseDocumentRequest, DocumentType } from '@/components/table/DocumentTableTypes';
import { sampleDocuments } from './sampleData';

export interface ExtendedDocumentRequest extends BaseDocumentRequest {
  department: string;
  documentType: DocumentType; // Fix: Use DocumentType instead of string
}

export const useAdminDashboardState = () => {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [documentLevel, setDocumentLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ExtendedDocumentRequest[]>(sampleDocuments);

  // Dialog states
  const [selectedDocument, setSelectedDocument] = useState<BaseDocumentRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showConfirmArchiveDialog, setShowConfirmArchiveDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);

  return {
    // State
    activeTab,
    setActiveTab,
    selectedCountry,
    setSelectedCountry,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    documentLevel,
    setDocumentLevel,
    selectedStatus,
    setSelectedStatus,
    documents,
    setDocuments,
    
    // Dialog state
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
