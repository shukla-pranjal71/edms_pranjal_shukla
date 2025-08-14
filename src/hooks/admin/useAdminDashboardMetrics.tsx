
import { ExtendedDocumentRequest } from './useAdminDashboardState';

export const useAdminDashboardMetrics = (documents: ExtendedDocumentRequest[]) => {
  // Calculate overall metrics
  const overallMetrics = {
    total: documents.length,
    live: documents.filter(doc => doc.status === 'live').length,
    underReview: documents.filter(doc => doc.status === 'under-review').length,
    underRevision: documents.filter(doc => doc.status === 'under-revision').length,
    approved: documents.filter(doc => doc.status === 'approved').length,
    archived: documents.filter(doc => doc.status === 'archived').length,
    deleted: documents.filter(doc => doc.status === 'deleted').length,
  };
  
  // Calculate country-based statistics
  const countryStatistics = documents.reduce((acc: Record<string, number>, doc) => {
    if (!acc[doc.country]) acc[doc.country] = 0;
    acc[doc.country]++;
    return acc;
  }, {});
  
  // Calculate department-based statistics
  const departmentStatistics = documents.reduce((acc: Record<string, number>, doc) => {
    if (!acc[doc.department]) acc[doc.department] = 0;
    acc[doc.department]++;
    return acc;
  }, {});
  
  // Calculate status-based statistics
  const statusStatistics = documents.reduce((acc: Record<string, number>, doc) => {
    if (!acc[doc.status]) acc[doc.status] = 0;
    acc[doc.status]++;
    return acc;
  }, {});

  return {
    overallMetrics,
    countryStatistics,
    departmentStatistics,
    statusStatistics
  };
};
