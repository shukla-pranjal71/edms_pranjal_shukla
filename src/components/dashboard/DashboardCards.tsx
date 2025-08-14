
import React from 'react';
import { DocumentRequest } from '../DocumentRequestForm';
import { ChangeRequest } from '../ChangeRequestForm';
import { UserRole } from '../table/DocumentTableTypes';

import {
  DocumentControllerCards
} from './cards';

interface DashboardCardsProps {
  documents: DocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: UserRole;
  handleFilterClick: (filter: string | null) => void;
  showChangeRequests: boolean;
  setShowChangeRequests: (show: boolean) => void;
  changeRequests: ChangeRequest[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  currentUserRole,
  handleFilterClick,
  showChangeRequests,
  setShowChangeRequests,
  changeRequests
}) => {
  // All roles now use the same DocumentControllerCards for standardized interface
  return (
    <div className="mt-6">
      <DocumentControllerCards 
        documents={documents}
        selectedCountry={selectedCountry}
        selectedDepartment={selectedDepartment}
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        currentUserRole={currentUserRole}
        handleFilterClick={handleFilterClick}
        showChangeRequests={showChangeRequests}
        setShowChangeRequests={setShowChangeRequests}
      />
    </div>
  );
};
