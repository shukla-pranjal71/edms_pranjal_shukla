
import React from 'react';
import CustomStatCard from '../../CustomStatCard';
import { DocumentRequest } from '../../DocumentRequestForm';
import { UserRole } from '../../table/DocumentTableTypes';
import { useDashboardCardHandlers } from '@/hooks/document';

interface DocumentOwnerCardsProps {
  documents: DocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: UserRole;
  handleFilterClick: (filter: string | null) => void;
  setShowChangeRequests: (show: boolean) => void;
}

export const DocumentOwnerCards: React.FC<DocumentOwnerCardsProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  currentUserRole,
  handleFilterClick,
  setShowChangeRequests
}) => {
  const { calculateDocumentMetrics } = useDashboardCardHandlers();

  const metrics = calculateDocumentMetrics(
    documents,
    selectedCountry,
    selectedDepartment,
    searchTerm,
    selectedFilter,
    currentUserRole as string
  );
  
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <CustomStatCard 
        title="For Review" 
        count={metrics.underReview || 0} 
        iconType="eye" 
        color="orange" 
        onClick={() => {
          handleFilterClick('under-review');
          setShowChangeRequests(false);
        }}
        isActive={selectedFilter === 'under-review'}
      />
      <CustomStatCard 
        title="Live" 
        count={metrics.breached} 
        iconType="alert" 
        color="red" 
        onClick={() => {
          handleFilterClick('breached');
          setShowChangeRequests(false);
        }}
        isActive={selectedFilter === 'breached'}
      />
      <CustomStatCard 
        title="Approved" 
        count={metrics.approved} 
        iconType="check" 
        color="green" 
        onClick={() => {
          handleFilterClick('approved');
          setShowChangeRequests(false);
        }}
        isActive={selectedFilter === 'approved'}
      />
    </div>
  );
};
