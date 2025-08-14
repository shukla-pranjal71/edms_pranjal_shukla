
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { ChangeRequest } from '@/components/ChangeRequestForm';
import { getDocumentStats } from './cardUtils';
import { useDashboardCardHandlers } from '@/hooks/document/useDashboardCardHandlers';

interface RequesterCardsProps {
  documents: DocumentRequest[];
  selectedCountry: string;
  selectedDepartment: string;
  searchTerm: string;
  selectedFilter: string | null;
  currentUserRole: string;
  handleFilterClick: (filter: string | null) => void;
  showChangeRequests: boolean;
  setShowChangeRequests: (show: boolean) => void;
  changeRequests: ChangeRequest[];
}

export const RequesterCards: React.FC<RequesterCardsProps> = ({
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
  const { calculateDocumentMetrics } = useDashboardCardHandlers();
  
  // Use the utility function to get document metrics
  const metrics = calculateDocumentMetrics(documents, selectedCountry, selectedDepartment, searchTerm, selectedFilter, currentUserRole);
  
  // Count pending change requests
  const pendingChangeRequests = changeRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card 
        className={`${selectedFilter === 'under-review' ? 'border-primary border-2' : ''} cursor-pointer`}
        onClick={() => handleFilterClick('under-review')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">For Review</CardTitle>
          <CardDescription>Documents in review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.underReview}</div>
        </CardContent>
      </Card>

      <Card 
        className={`${selectedFilter === 'breached' ? 'border-primary border-2' : ''} cursor-pointer`}
        onClick={() => handleFilterClick('breached')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Live</CardTitle>
          <CardDescription>SLA timeframes exceeded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.breached}</div>
        </CardContent>
      </Card>

      <Card 
        className={`${selectedFilter === 'approved' ? 'border-primary border-2' : ''} cursor-pointer`}
        onClick={() => handleFilterClick('approved')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Approved</CardTitle>
          <CardDescription>Documents approved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.approved}</div>
        </CardContent>
      </Card>
    </div>
  );
};
