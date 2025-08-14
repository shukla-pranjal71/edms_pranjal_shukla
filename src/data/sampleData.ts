
// This file now imports from hardcodedData to maintain backward compatibility
import { documents, changeRequests, countries, departments } from './hardcodedData';
import { DocumentRequest } from '../components/DocumentRequestForm';
import { ChangeRequest } from '../components/ChangeRequestForm';

// Re-export hardcoded data for backward compatibility
export const documentOwners: any[] = [];
export const reviewers: any[] = [];
export const documentCreators: any[] = [];
export const complianceContacts: any[] = [];
export const complianceStandards: any[] = [];

// Export country and department names as string arrays
export const countriesArray: string[] = countries.map(c => c.name);
export const departmentsArray: string[] = departments.map(d => d.name);

// Export functions that return hardcoded data
export const getSampleDocuments = (): DocumentRequest[] => {
  return [...documents];
};

export const getSampleChangeRequests = (): ChangeRequest[] => {
  return [...changeRequests];
};

export const getInitialSampleData = () => {
  return { 
    documents: [...documents], 
    changeRequests: [...changeRequests] 
  };
};
