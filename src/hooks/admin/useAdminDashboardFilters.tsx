import { useState } from 'react';
import { ExtendedDocumentRequest } from './useAdminDashboardState';

export const useAdminDashboardFilters = (
  documents: ExtendedDocumentRequest[],
  selectedCountry: string,
  selectedDepartment: string,
  searchTerm: string,
  selectedStatus: string | null
) => {
  // Apply filters to the documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCountry = selectedCountry === 'all' || doc.country === selectedCountry;
    const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
    const matchesSearch = searchTerm === '' || 
      doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Exclude archived and deleted documents from the main view
    const isActiveStatus = doc.status !== 'archived' && doc.status !== 'deleted';
    
    // Add status filter logic
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    
    return matchesCountry && matchesDepartment && matchesSearch && isActiveStatus && matchesStatus;
  });
  
  // Get archived documents
  const archivedDocuments = documents.filter(doc => {
    const matchesCountry = selectedCountry === 'all' || doc.country === selectedCountry;
    const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
    const matchesSearch = searchTerm === '' || 
      doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCountry && matchesDepartment && matchesSearch && doc.status === 'archived';
  });
  
  // Get deleted documents
  const deletedDocuments = documents.filter(doc => {
    const matchesCountry = selectedCountry === 'all' || doc.country === selectedCountry;
    const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
    const matchesSearch = searchTerm === '' || 
      doc.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCountry && matchesDepartment && matchesSearch && doc.status === 'deleted';
  });

  return {
    filteredDocuments,
    archivedDocuments,
    deletedDocuments
  };
};
