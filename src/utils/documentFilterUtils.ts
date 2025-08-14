
import { DocumentRequest } from '../components/DocumentRequestForm';
import { UserRole } from '../components/table/DocumentTableTypes';

export const getFilteredDocuments = (
  documents: DocumentRequest[], 
  selectedCountry: string, 
  selectedDepartment: string, 
  searchTerm: string, 
  selectedFilter: string | null
) => {
  let filtered = documents;
  
  if (selectedFilter === 'breached') {
    filtered = filtered.filter(doc => doc.isBreached === true);
  } else if (selectedFilter) {
    filtered = filtered.filter(doc => doc.status === selectedFilter);
  }
  
  if (selectedCountry !== 'all') {
    filtered = filtered.filter(doc => doc.country === selectedCountry);
  }
  if (selectedDepartment !== 'all') {
    filtered = filtered.filter(doc => (doc as any).department === selectedDepartment);
  }
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.sopName.toLowerCase().includes(searchLower) || 
      doc.documentCode.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

export const getArchivedDocuments = (
  documents: DocumentRequest[], 
  selectedCountry: string, 
  selectedDepartment: string, 
  archivedSearchTerm: string
) => {
  let filtered = documents.filter(doc => doc.status === 'archived');
  if (selectedCountry !== 'all') {
    filtered = filtered.filter(doc => doc.country === selectedCountry);
  }
  if (selectedDepartment !== 'all') {
    filtered = filtered.filter(doc => (doc as any).department === selectedDepartment);
  }
  if (archivedSearchTerm) {
    const searchLower = archivedSearchTerm.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.sopName.toLowerCase().includes(searchLower) || 
      doc.documentCode.toLowerCase().includes(searchLower)
    );
  }
  return filtered;
};

export const getDisplayDocuments = (
  documents: DocumentRequest[], 
  selectedCountry: string, 
  selectedDepartment: string, 
  searchTerm: string, 
  selectedFilter: string | null, 
  currentUserRole: string
) => {
  let filteredDocs = documents;
  
  if (selectedFilter === 'breached') {
    filteredDocs = filteredDocs.filter(doc => doc.isBreached === true);
  } else if (selectedFilter) {
    filteredDocs = filteredDocs.filter(doc => doc.status === selectedFilter);
  }
  
  if (selectedCountry !== 'all') {
    filteredDocs = filteredDocs.filter(doc => doc.country === selectedCountry);
  }
  if (selectedDepartment !== 'all') {
    filteredDocs = filteredDocs.filter(doc => (doc as any).department === selectedDepartment);
  }
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredDocs = filteredDocs.filter(doc => 
      doc.sopName.toLowerCase().includes(searchLower) || 
      doc.documentCode.toLowerCase().includes(searchLower)
    );
  }
  if (currentUserRole === 'document-controller') {
    filteredDocs = filteredDocs.filter(doc => 
      doc.status !== 'deleted' && doc.status !== 'archived'
    );
  } else if (currentUserRole === 'document-owner') {
    filteredDocs = filteredDocs.filter(doc => 
      doc.documentOwners.some(owner => owner.id === '1') && 
      doc.status !== 'deleted' && 
      doc.status !== 'archived'
    );
  } else if (currentUserRole === 'reviewer') {
    filteredDocs = filteredDocs.filter(doc => 
      doc.reviewers && 
      doc.reviewers.some(reviewer => reviewer.id === '2') && 
      doc.status !== 'deleted' && 
      doc.status !== 'archived'
    );
  } else {
    filteredDocs = filteredDocs.filter(doc => 
      doc.status !== 'deleted' && 
      doc.status !== 'archived'
    );
  }
  return filteredDocs;
};
