
import React from 'react';
import CustomStatCard from '../../CustomStatCard';
import { DocumentRequest } from '../../DocumentRequestForm';
import { getDocumentStats, getChangeRequestStats } from './cardUtils';
import { UserRole } from '../../table/DocumentTableTypes';

interface DocumentControllerCardsProps {
  documents: DocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: UserRole;
  handleFilterClick: (filter: string | null) => void;
  showChangeRequests: boolean;
  setShowChangeRequests: (show: boolean) => void;
}

export const DocumentControllerCards: React.FC<DocumentControllerCardsProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  currentUserRole,
  handleFilterClick,
  showChangeRequests,
  setShowChangeRequests
}) => {
  // Calculate filtered statistics
  const stats = getDocumentStats(documents, selectedCountry, selectedDepartment, searchTerm);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <CustomStatCard
        title="For Review"
        count={stats.underReview}
        iconType="clock"
        color="yellow"
        onClick={() => handleFilterClick('under-review')}
        isActive={selectedFilter === 'under-review'}
      />
      
      <CustomStatCard
        title="Approved"
        count={stats.approved}
        iconType="check"
        color="green"
        onClick={() => handleFilterClick('approved')}
        isActive={selectedFilter === 'approved'}
      />
      
      <CustomStatCard
        title="Live"
        count={stats.breached}
        iconType="alert"
        color="red"
        onClick={() => handleFilterClick('breached')}
        isActive={selectedFilter === 'breached'}
      />
    </div>
  );
};
