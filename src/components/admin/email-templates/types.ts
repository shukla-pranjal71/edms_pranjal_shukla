
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  timerEnabled: boolean;
  triggerAction: string;
  recipients: string[];
  cc?: string[];
  department?: string;
  country?: string;
  slaPeriod?: number; // Added SLA Period field
}

export interface RecipientOption {
  value: string;
  label: string;
}

export interface CCUser {
  id: string;
  name: string;
  email: string;
  department: string;
  country: string;
}

export const triggerOptions: RecipientOption[] = [
  {
    value: "doc-upload-controller",
    label: "Document uploaded for review by Document Controller"
  }, {
    value: "doc-upload-reviewer",
    label: "Document uploaded for review by Reviewer"
  }, {
    value: "doc-approved-owner",
    label: "Document approved by Document Owner"
  }, {
    value: "doc-rejected-owner",
    label: "Document rejected by Document Owner"
  }, {
    value: "doc-published-controller",
    label: "Document published live by Document Controller"
  }, {
    value: "review-deadline-missed",
    label: "Review deadline missed by Reviewer"
  }
];

export const recipientOptions: RecipientOption[] = [
  {
    value: "document-owner",
    label: "Document Owner"
  }, {
    value: "document-controller",
    label: "Document Controller"
  }, {
    value: "reviewers",
    label: "Reviewers"
  }, {
    value: "approvers",
    label: "Approvers"
  }, {
    value: "all-users",
    label: "All Users"
  }
];

export const countryOptions: RecipientOption[] = [
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'KSA', label: 'Kingdom of Saudi Arabia' },
  { value: 'OMN', label: 'Oman' },
  { value: 'BHR', label: 'Bahrain' },
  { value: 'EGY', label: 'Egypt' },
  { value: 'all', label: 'All Countries' }
];

export const departmentOptions: RecipientOption[] = [
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations', label: 'Operations' },
  { value: 'R&D', label: 'R&D' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Supply Chain', label: 'Supply Chain' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'Product Development', label: 'Product Development' },
  { value: 'Procurement', label: 'Procurement' },
  { value: 'Administration', label: 'Administration' }
];

export const ccUserOptions: CCUser[] = [
  { id: 'user1', name: 'John Doe', email: 'john@example.com', department: 'IT', country: 'UAE' },
  { id: 'user2', name: 'Sarah Johnson', email: 'sarah@example.com', department: 'HR', country: 'KSA' },
  { id: 'user3', name: 'Mohammed Ali', email: 'mohammed@example.com', department: 'Finance', country: 'UAE' },
  { id: 'user4', name: 'Lisa Wong', email: 'lisa@example.com', department: 'Marketing', country: 'EGY' },
  { id: 'user5', name: 'Amir Khan', email: 'amir@example.com', department: 'Operations', country: 'OMN' },
  { id: 'user6', name: 'Emily Chen', email: 'emily@example.com', department: 'Legal', country: 'BHR' },
  { id: 'user7', name: 'David Smith', email: 'david@example.com', department: 'Sales', country: 'KSA' },
];
