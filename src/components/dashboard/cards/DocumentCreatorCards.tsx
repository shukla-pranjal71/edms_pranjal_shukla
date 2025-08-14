
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { getDocumentStats } from './cardUtils';
import { Eye, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';

interface DocumentCreatorCardsProps {
  documents: DocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: string;
  handleFilterClick: (filter: string | null) => void;
  showChangeRequests?: boolean;
  setShowChangeRequests?: (show: boolean) => void;
}

export const DocumentCreatorCards: React.FC<DocumentCreatorCardsProps> = ({
  documents,
  selectedCountry,
  selectedDepartment,
  searchTerm,
  selectedFilter,
  currentUserRole,
  handleFilterClick
}) => {
  // Use the utility function to get document statistics
  const stats = getDocumentStats(documents, selectedCountry, selectedDepartment, searchTerm);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <StatCard
        title="Draft"
        value={stats.draft.toString()}
        description="Documents in draft status"
        isActive={selectedFilter === 'draft'}
        onClick={() => handleFilterClick('draft')}
      />

      <StatCard
        title="For Review"
        value={stats.underReview.toString()}
        description="Documents being reviewed"
        isActive={selectedFilter === 'under-review'}
        onClick={() => handleFilterClick('under-review')}
      />

      <StatCard
        title="Live"
        value={stats.breached.toString()}
        description="Documents with breached SLA"
        isActive={selectedFilter === 'breached'}
        onClick={() => handleFilterClick('breached')}
      />
    </div>
  );
};
