
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

interface DocumentMetrics {
  totalDocuments: number;
  pendingApproval: number;
  underReview: number;
  approved: number;
  breached: number;
  liveDocuments: number;
}

export const useDashboardCardHandlers = () => {
  // Calculate document metrics based on filters
  const calculateDocumentMetrics = (
    documents: DocumentRequest[],
    selectedCountry: string = 'all',
    selectedDepartment: string = 'all',
    searchTerm: string = '',
    selectedFilter: string | null = null,
    userRole: string = ''
  ): DocumentMetrics => {
    // Filter documents based on country, department, and search term
    const filteredDocs = documents.filter(doc => {
      const matchesCountry = selectedCountry === 'all' || doc.country === selectedCountry;
      const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
      const matchesSearch = searchTerm === '' || 
                            doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.documentCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCountry && matchesDepartment && matchesSearch;
    });
    
    // Count documents by status
    const totalDocuments = filteredDocs.length;
    const underReview = filteredDocs.filter(doc => doc.status === 'under-review').length;
    const pendingApproval = filteredDocs.filter(doc => doc.status === 'pending-approval').length;
    const approved = filteredDocs.filter(doc => doc.status === 'approved').length;
    const liveDocuments = filteredDocs.filter(doc => doc.status === 'live').length;
    
    // Count breached SLAs
    const breached = filteredDocs.filter(doc => doc.isBreached).length;
    
    return {
      totalDocuments,
      pendingApproval,
      underReview,
      approved,
      breached,
      liveDocuments
    };
  };
  
  // Handle filter changes when clicking on cards
  const handleCardFilterClick = (filter: string) => {
    return filter;
  };

  return {
    calculateDocumentMetrics,
    handleCardFilterClick
  };
};
