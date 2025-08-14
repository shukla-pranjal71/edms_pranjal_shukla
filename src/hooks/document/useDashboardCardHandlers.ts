import { DocumentRequest } from '@/components/DocumentRequestForm';

export interface DocumentMetrics {
  totalDocuments: number;
  underReview: number;
  pendingApproval: number;
  liveDocuments: number;
  archivedDocuments: number;
  overdue: number;
  breached: number;
  approved: number;
}

export const useDashboardCardHandlers = () => {
  // Function to calculate document metrics
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
      const matchesSearch = !searchTerm || 
        doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (doc.documentCode && doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCountry && matchesDepartment && matchesSearch;
    });
    
    // Calculate metrics
    const totalDocuments = filteredDocs.length;
    const underReview = filteredDocs.filter(doc => doc.status === 'under-review').length;
    const pendingApproval = filteredDocs.filter(doc => doc.status === 'under-review').length;
    const liveDocuments = filteredDocs.filter(doc => doc.status === 'live').length;
    const archivedDocuments = filteredDocs.filter(doc => doc.status === 'archived').length;
    const approved = filteredDocs.filter(doc => doc.status === 'approved').length;
    
    // Calculate overdue documents (based on breached review deadlines)
    const overdue = filteredDocs.filter(doc => doc.isBreached).length;
    const breached = filteredDocs.filter(doc => doc.isBreached).length;
    
    return {
      totalDocuments,
      underReview,
      pendingApproval,
      liveDocuments,
      archivedDocuments,
      overdue,
      breached,
      approved
    };
  };

  // Function to handle card clicks for filtering
  const handleCardFilterClick = (filter: string | null, currentFilter: string | null) => {
    // If clicking the same filter, toggle it off
    if (filter === currentFilter) {
      return null;
    }
    
    // Otherwise, set the new filter
    return filter;
  };

  return {
    calculateDocumentMetrics,
    handleCardFilterClick
  };
};
