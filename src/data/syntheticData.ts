
import { DocumentRequest } from '@/components/DocumentRequestForm';
import { ChangeRequest } from '@/components/ChangeRequestForm';

// Utility functions for generating data - kept for potential future use
export const generatePersonData = () => {
  const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Lisa Wilson', 'David Miller'];
  const emails = ['john.smith@company.com', 'sarah.johnson@company.com', 'michael.brown@company.com', 'lisa.wilson@company.com', 'david.miller@company.com'];
  const randomIndex = Math.floor(Math.random() * names.length);
  return {
    id: `person-${randomIndex}`,
    name: names[randomIndex],
    email: emails[randomIndex]
  };
};

export const generateDocumentCodeData = () => {
  const departments = ['MAN', 'QUA', 'OPE', 'HUM', 'FIN'];
  const randomDept = departments[Math.floor(Math.random() * departments.length)];
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${randomDept}-${randomNum}`;
};

export const generateCommentData = () => {
  const comments = [
    'Initial request submitted',
    'Under review by document owner',
    'Request approved',
    'Ready for implementation',
    'Request rejected',
    'Needs more detailed proposal'
  ];
  return comments[Math.floor(Math.random() * comments.length)];
};

// Return empty data - all content will come from backend
export const getInitialSyntheticData = () => {
  const documents: DocumentRequest[] = [];
  const changeRequests: ChangeRequest[] = [];

  return { documents, changeRequests };
};
