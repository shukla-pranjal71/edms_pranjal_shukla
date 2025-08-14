import { useState, useEffect } from 'react';
import { DocumentRequest } from '../components/DocumentRequestForm';
import { AdminConfig } from '../components/AdminConfigDialog';
import { ChangeRequest } from '../components/ChangeRequestForm';
import { UserRole } from '../components/table/DocumentTableTypes';
import { initialConfig } from '../data/initialData';
import { documentService } from '../services/documentService';
import { changeRequestService } from '../services/changeRequestService';
import { createEmptyDocument } from '@/utils/documentGenerationUtils';

export const useDashboardState = () => {
  // Document related state
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // User context for document filtering
  const [currentUserId, setCurrentUserId] = useState<string>('user-123'); // Mock current user ID
  
  // Form and dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewPromptOpen, setIsReviewPromptOpen] = useState(false);
  const [isReviewerSelectionOpen, setIsReviewerSelectionOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [isReviewUploadOpen, setIsReviewUploadOpen] = useState(false);
  const [isDocumentApprovalOpen, setIsDocumentApprovalOpen] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter and view states
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showArchivedDocuments, setShowArchivedDocuments] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [archivedSearchTerm, setArchivedSearchTerm] = useState<string>('');
  
  // User role state
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('document-controller');
  
  // Config state
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(initialConfig);
  
  // Change request states
  const [showChangeRequests, setShowChangeRequests] = useState(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isChangeRequestFormOpen, setIsChangeRequestFormOpen] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);
  const [isChangeRequestDetailsOpen, setIsChangeRequestDetailsOpen] = useState(false);

  // Load documents and change requests with user filtering
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        console.log('Fetching documents for user:', currentUserId, 'role:', currentUserRole);
        
        // Load documents filtered by user assignment
        const allDocuments = await documentService.getAllDocuments(currentUserId, currentUserRole);
        console.log('Fetched filtered documents:', allDocuments);
        
        const allChangeRequests = await changeRequestService.getAllChangeRequests();
        console.log('Fetched change requests:', allChangeRequests);
        
        setDocuments(allDocuments);
        setChangeRequests(allChangeRequests);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError(error instanceof Error ? error.message : 'Unknown error occurred');
        
        const emptyDoc = createEmptyDocument();
        setDocuments([emptyDoc]);
        setChangeRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUserId, currentUserRole]);

  return {
    // Document related state
    documents, setDocuments,
    selectedDocument, setSelectedDocument,
    isLoading,
    loadError,
    
    // User context
    currentUserId, setCurrentUserId,
    
    // Form and dialog states
    isFormOpen, setIsFormOpen,
    isReviewPromptOpen, setIsReviewPromptOpen,
    isReviewerSelectionOpen, setIsReviewerSelectionOpen,
    isDocumentUploadOpen, setIsDocumentUploadOpen,
    isApprovalDialogOpen, setIsApprovalDialogOpen,
    isAdminConfigOpen, setIsAdminConfigOpen,
    isReviewUploadOpen, setIsReviewUploadOpen,
    isDocumentApprovalOpen, setIsDocumentApprovalOpen,
    showDetailsDialog, setShowDetailsDialog,
    
    // Filter and view states
    selectedFilter, setSelectedFilter,
    showArchivedDocuments, setShowArchivedDocuments,
    selectedCountry, setSelectedCountry,
    selectedDepartment, setSelectedDepartment,
    searchTerm, setSearchTerm,
    archivedSearchTerm, setArchivedSearchTerm,
    
    // User role state
    currentUserRole, setCurrentUserRole,
    
    // Config state
    adminConfig, setAdminConfig,
    
    // Change request states
    showChangeRequests, setShowChangeRequests,
    changeRequests, setChangeRequests,
    isChangeRequestFormOpen, setIsChangeRequestFormOpen,
    selectedChangeRequest, setSelectedChangeRequest,
    isChangeRequestDetailsOpen, setIsChangeRequestDetailsOpen
  };
};
