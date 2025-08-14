import { DocumentRequest } from '@/components/DocumentRequestForm';
import { ChangeRequest } from '@/components/ChangeRequestForm';

export function getDocumentStats(
  documents: DocumentRequest[],
  selectedCountry: string,
  selectedDepartment: string,
  searchTerm: string
) {
  // Handle empty documents array gracefully
  if (!documents || documents.length === 0) {
    return {
      draft: 0,
      underReview: 0,
      approved: 0,
      breached: 0,
      liveCR: 0,
    };
  }

  // Filter documents based on selected filters
  let filtered = [...documents];
  
  if (selectedCountry !== 'all') {
    filtered = filtered.filter(doc => doc.country === selectedCountry);
  }
  
  if (selectedDepartment !== 'all') {
    filtered = filtered.filter(doc => doc.department === selectedDepartment);
  }
  
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.sopName.toLowerCase().includes(searchLower) ||
      (doc.documentCode && doc.documentCode.toLowerCase().includes(searchLower)) ||
      (doc.country && doc.country.toLowerCase().includes(searchLower)) ||
      (doc.department && doc.department.toLowerCase().includes(searchLower))
    );
  }
  
  // Count documents by status from filtered results
  return {
    draft: filtered.filter(doc => doc.status === 'draft').length,
    underReview: filtered.filter(doc => doc.status === 'under-review').length,
    approved: filtered.filter(doc => doc.status === 'approved').length,
    breached: filtered.filter(doc => doc.isBreached === true).length,
    liveCR: filtered.filter(doc => doc.status === 'live-cr').length,
  };
}

export function getChangeRequestStats(
  changeRequests: ChangeRequest[],
  selectedCountry: string,
  selectedDepartment: string,
  searchTerm: string
) {
  // Handle empty change requests array gracefully
  if (!changeRequests || changeRequests.length === 0) {
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
  }

  // Filter change requests based on selected filters
  let filtered = [...changeRequests];
  
  if (selectedCountry !== 'all') {
    filtered = filtered.filter(req => req.country === selectedCountry);
  }
  
  if (selectedDepartment !== 'all') {
    filtered = filtered.filter(req => req.department === selectedDepartment);
  }
  
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(req => 
      req.documentName.toLowerCase().includes(searchLower) ||
      req.requestType.toLowerCase().includes(searchLower) ||
      (req.description && req.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Count change requests by status from filtered results
  return {
    total: filtered.length,
    pending: filtered.filter(req => req.status === 'pending').length,
    approved: filtered.filter(req => req.status === 'approved').length,
    rejected: filtered.filter(req => req.status === 'rejected').length
  };
}
