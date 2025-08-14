
import { DocumentRequest } from '../components/DocumentRequestForm';
import { AdminConfig } from '../components/AdminConfigDialog';
import { ChangeRequest } from '../components/ChangeRequestForm';

// Empty initial documents - all data will come from user input and backend
export const initialDocuments: DocumentRequest[] = [];

export const initialConfig: AdminConfig = {
  reviewTimelineDays: 10
};

// Empty initial change requests - all data will come from user input and backend
export const initialChangeRequests: ChangeRequest[] = [];
