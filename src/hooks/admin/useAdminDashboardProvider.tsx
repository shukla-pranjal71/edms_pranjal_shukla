
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { safeDocumentStatus } from '@/utils/documentUtils';
import { useAdminDashboardState, ExtendedDocumentRequest } from './useAdminDashboardState';
import { useAdminDashboardHandlers } from './useAdminDashboardHandlers';
import { useAdminDashboardFilters } from './useAdminDashboardFilters';
import { useAdminDashboardMetrics } from './useAdminDashboardMetrics';
import { documentService } from '@/services/documentService';
import { createEmptyDocument } from '@/utils/documentGenerationUtils';

// Define the ChangeRequestStatus type so it can be exported
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Context type
interface AdminDashboardContextType {
  // State
  documents: any[];
  setDocuments: React.Dispatch<React.SetStateAction<any[]>>;
  selectedDocument: BaseDocumentRequest | null;
  setSelectedDocument: React.Dispatch<React.SetStateAction<BaseDocumentRequest | null>>;
  selectedCountry: string;
  setSelectedCountry: React.Dispatch<React.SetStateAction<string>>;
  selectedDepartment: string;
  setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  documentLevel: string;
  setDocumentLevel: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  showDetailsDialog: boolean;
  setShowDetailsDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showNotificationDialog: boolean;
  setShowNotificationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmArchiveDialog: boolean;
  setShowConfirmArchiveDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmDeleteDialog: boolean;
  setShowConfirmDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  countryStatistics: any;
  departmentStatistics: any;
  statusStatistics: any;
  filteredDocuments: any[];
  archivedDocuments: any[];
  deletedDocuments: any[];
  selectedStatus: string | null;
  overallMetrics: {
    total: number;
    live: number;
    underReview: number;
    underRevision: number;
    approved: number;
    archived: number;
    deleted: number;
  };
  
  // Handler functions
  handleViewDocument: (document: BaseDocumentRequest) => void;
  handleStatusFilterClick: (status: string | null) => string | null;
  handleDownload: (document: BaseDocumentRequest) => void;
  handlePushNotification: (document: BaseDocumentRequest) => void;
  handleSendNotification: (role: string) => void;
  handleArchiveDocument: (document: BaseDocumentRequest) => void;
  confirmArchive: () => void;
  handleDeleteDocument: (document: BaseDocumentRequest) => void;
  confirmDelete: () => void;
  handleRestoreDocument: (document: BaseDocumentRequest) => void;
  handleLogout: () => void;
  handleExportDocuments: () => void;
}

// Create the context
const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

// Provider component
export const AdminDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Use the state hook
  const {
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    selectedCountry,
    setSelectedCountry,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    documentLevel,
    setDocumentLevel,
    activeTab,
    setActiveTab,
    showDetailsDialog,
    setShowDetailsDialog,
    showNotificationDialog,
    setShowNotificationDialog,
    showConfirmArchiveDialog,
    setShowConfirmArchiveDialog,
    showConfirmDeleteDialog,
    setShowConfirmDeleteDialog,
  } = useAdminDashboardState();
  
  // Use the filters hook
  const {
    filteredDocuments
  } = useAdminDashboardFilters(documents, selectedCountry, selectedDepartment, searchTerm, selectedStatus);
  
  // Calculate archived and deleted documents
  const archivedDocuments = documents.filter(doc => doc.status === 'archived');
  const deletedDocuments = documents.filter(doc => doc.status === 'deleted');
  
  // Use the metrics hook
  const {
    overallMetrics
  } = useAdminDashboardMetrics(documents);

  // Custom calculation for statistics
  const countryStatistics = documents.reduce((acc: any, doc) => {
    if (!acc[doc.country]) acc[doc.country] = 0;
    acc[doc.country]++;
    return acc;
  }, {});

  const departmentStatistics = documents.reduce((acc: any, doc) => {
    if (doc.department) {
      if (!acc[doc.department]) acc[doc.department] = 0;
      acc[doc.department]++;
    }
    return acc;
  }, {});

  const statusStatistics = documents.reduce((acc: any, doc) => {
    if (!acc[doc.status]) acc[doc.status] = 0;
    acc[doc.status]++;
    return acc;
  }, {});
  
  // Use the handlers hook
  const {
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
  } = useAdminDashboardHandlers(
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    setShowDetailsDialog,
    setShowNotificationDialog,
    setShowConfirmArchiveDialog,
    setShowConfirmDeleteDialog,
    activeTab,
    filteredDocuments,
    setSelectedStatus,
    selectedStatus
  );
  
  // Load initial data
  useEffect(() => {
    // Fetch data from hardcoded service only
    setIsLoading(true);
    try {
      const fetchDocuments = async () => {
        const fetchedDocuments = await documentService.getAllDocuments();
        if (fetchedDocuments.length > 0) {
          // Make sure all documents have department property, documentType, and isBreached for ExtendedDocumentRequest
          const extendedDocs: ExtendedDocumentRequest[] = fetchedDocuments.map(doc => ({
            ...doc,
            department: doc.department || 'Unknown',
            documentType: doc.documentType || 'SOP',
            createdAt: doc.createdAt || new Date().toISOString(),
            uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
            isBreached: doc.isBreached || false // Ensure isBreached is always present
          }));
          
          setDocuments(extendedDocs);
          toast({
            title: "Documents Loaded",
            description: `Successfully loaded ${extendedDocs.length} documents.`,
            variant: "default"
          });
        } else {
          // Create a sample document if none exists
          const emptyDoc = {
            ...createEmptyDocument(),
            department: 'Unknown',
            documentType: 'SOP',
            isBreached: false, // Ensure isBreached is present
            // Ensure status is properly typed using safeDocumentStatus imported from documentUtils
            status: safeDocumentStatus('draft')
          } as ExtendedDocumentRequest;
          
          setDocuments([emptyDoc]);
          await documentService.createDocument(emptyDoc as any); // Use type assertion to avoid error
          toast({
            title: "No Documents Found",
            description: "Created a sample document to get started.",
            variant: "default"
          });
        }
      };
      
      fetchDocuments()
        .catch(error => {
          console.error("Error fetching documents:", error);
          // Create a basic empty document as fallback
          const emptyDoc = {
            ...createEmptyDocument(),
            department: 'Unknown',
            documentType: 'SOP',
            isBreached: false, // Ensure isBreached is present
            status: safeDocumentStatus('draft') // Use safeDocumentStatus from documentUtils here too
          } as ExtendedDocumentRequest;
          
          setDocuments([emptyDoc]);
          toast({
            title: "Error Loading Documents",
            description: "Created a sample document. Changes won't persist until connection is restored.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error("Error loading documents:", error);
      // Create a basic empty document as fallback
      const emptyDoc = {
        ...createEmptyDocument(),
        department: 'Unknown',
        documentType: 'SOP',
        isBreached: false, // Ensure isBreached is present
        status: safeDocumentStatus('draft') // Use safeDocumentStatus from documentUtils here too
      } as ExtendedDocumentRequest;
      
      setDocuments([emptyDoc]);
      toast({
        title: "Error Loading Documents",
        description: "Created a sample document. Changes won't persist until connection is restored.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [toast]);
  
  // Create the context value
  const contextValue: AdminDashboardContextType = {
    // State
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    selectedCountry,
    setSelectedCountry,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    documentLevel,
    setDocumentLevel,
    activeTab,
    setActiveTab,
    showDetailsDialog,
    setShowDetailsDialog,
    showNotificationDialog,
    setShowNotificationDialog,
    showConfirmArchiveDialog,
    setShowConfirmArchiveDialog,
    showConfirmDeleteDialog,
    setShowConfirmDeleteDialog,
    isLoading,
    countryStatistics,
    departmentStatistics,
    statusStatistics,
    filteredDocuments,
    archivedDocuments,
    deletedDocuments,
    selectedStatus,
    overallMetrics,
    
    // Handler functions
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
  
  return (
    <AdminDashboardContext.Provider value={contextValue}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

// Custom hook to use the admin dashboard context
export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error('useAdminDashboard must be used within an AdminDashboardProvider');
  }
  return context;
};
