import { useState, useEffect } from 'react';
import { DocumentRequest, DocumentStatus } from '../components/DocumentRequestForm';
import { AdminConfig } from '../components/AdminConfigDialog';
import { ChangeRequest } from '../components/ChangeRequestForm';
import { UserRole } from '../components/table/DocumentTableTypes';
import { getInitialSyntheticData } from '../data/syntheticData';

export const useDashboardState = () => {
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    countries: ['UAE', 'KSA', 'OMN', 'BHR', 'EGY'],
    departments: ['Finance', 'HR', 'IT', 'Legal', 'Marketing', 'Operations', 'R&D', 'Sales', 'Supply Chain'],
    documentTypes: ['SOP', 'Policy', 'Procedure', 'Work Instruction', 'Form', 'Template'],
    reviewPeriods: [30, 60, 90, 180, 365]
  });
  const [isReviewPromptOpen, setIsReviewPromptOpen] = useState(false);
  const [isReviewerSelectionOpen, setIsReviewerSelectionOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [isReviewUploadOpen, setIsReviewUploadOpen] = useState(false);
  const [isDocumentApprovalOpen, setIsDocumentApprovalOpen] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showArchivedDocuments, setShowArchivedDocuments] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('document-controller');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [archivedSearchTerm, setArchivedSearchTerm] = useState<string>('');
  const [showChangeRequests, setShowChangeRequests] = useState(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isChangeRequestFormOpen, setIsChangeRequestFormOpen] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null);
  const [isChangeRequestDetailsOpen, setIsChangeRequestDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const { documents, changeRequests } = getInitialSyntheticData();
      setDocuments(documents);
      setChangeRequests(changeRequests);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    isFormOpen,
    setIsFormOpen,
    selectedFilter,
    setSelectedFilter,
    adminConfig,
    setAdminConfig,
    isReviewPromptOpen,
    setIsReviewPromptOpen,
    isReviewerSelectionOpen,
    setIsReviewerSelectionOpen,
    isDocumentUploadOpen,
    setIsDocumentUploadOpen,
    isApprovalDialogOpen,
    setIsApprovalDialogOpen,
    isAdminConfigOpen,
    setIsAdminConfigOpen,
    isReviewUploadOpen,
    setIsReviewUploadOpen,
    isDocumentApprovalOpen,
    setIsDocumentApprovalOpen,
    showDetailsDialog,
    setShowDetailsDialog,
    showArchivedDocuments,
    setShowArchivedDocuments,
    currentUserRole,
    setCurrentUserRole,
    selectedCountry,
    setSelectedCountry,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    archivedSearchTerm,
    setArchivedSearchTerm,
    showChangeRequests,
    setShowChangeRequests,
    changeRequests,
    setChangeRequests,
    isChangeRequestFormOpen,
    setIsChangeRequestFormOpen,
    selectedChangeRequest,
    setSelectedChangeRequest,
    isChangeRequestDetailsOpen,
    setIsChangeRequestDetailsOpen,
    isLoading
  };
};
