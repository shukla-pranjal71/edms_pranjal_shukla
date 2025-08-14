import { DocumentRequest } from '../components/DocumentRequestForm';
import { ChangeRequest } from '../components/ChangeRequestForm';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '../services/departmentService';

// Countries data
export const countries = [
  { id: 1, name: "UAE", created_at: "2025-05-20T14:35:45.759082+00:00" },
  { id: 2, name: "KSA", created_at: "2025-05-20T14:35:45.759082+00:00" },
  { id: 3, name: "Oman", created_at: "2025-05-20T14:35:45.759082+00:00" },
  { id: 4, name: "Bahrain", created_at: "2025-05-20T14:35:45.759082+00:00" },
  { id: 5, name: "Egypt", created_at: "2025-05-20T14:35:45.759082+00:00" },
  { id: 10, name: "China", created_at: "2025-06-17T06:38:08.129343+00:00" }
];

// Departments data - properly typed as Department[]
export const departments: Department[] = [
  { id: 1, name: "Finance", created_at: "2025-05-20T14:38:34.506197+00:00", approverName: "John Smith", approverEmail: "john.smith@finance.com" },
  { id: 2, name: "HR", created_at: "2025-05-20T14:38:34.506197+00:00", approverName: "Sarah Johnson", approverEmail: "sarah.johnson@hr.com" },
  { id: 3, name: "IT", created_at: "2025-05-20T14:38:34.506197+00:00", approverName: "Mike Wilson", approverEmail: "mike.wilson@it.com" },
  { id: 4, name: "Legal", created_at: "2025-05-20T14:38:34.506197+00:00", approverName: "Emily Davis", approverEmail: "emily.davis@legal.com" },
  { id: 5, name: "Marketing", created_at: "2025-05-20T14:38:34.506197+00:00", approverName: "Alex Brown", approverEmail: "alex.brown@marketing.com" },
  { id: 6, name: "DG Help", created_at: "2025-05-20T14:53:16.58769+00:00" },
  { id: 7, name: "Low Code", created_at: "2025-05-20T14:53:25.372276+00:00" },
  { id: 8, name: "PRO", created_at: "2025-05-20T17:46:12.48845+00:00" },
  { id: 9, name: "Business Process", created_at: "2025-05-22T06:45:37.844207+00:00" },
  { id: 10, name: "Retail", created_at: "2025-05-27T09:49:10.771519+00:00" }
];

// Document types data
export const documentTypes = [
  { id: 1, name: "SOP", department: "General", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: 2, name: "Policy", department: "HR", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: 3, name: "Procedure", department: "IT", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: 4, name: "Guideline", department: "Finance", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: 5, name: "Manual", department: "Legal", created_at: "2025-05-20T14:38:34.506197+00:00" }
];

// Document names data
export const documentNames = [
  { id: "1", name: "Employee Onboarding", department: "HR", document_type: "SOP", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: "2", name: "IT Security Guidelines", department: "IT", document_type: "Policy", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: "3", name: "Financial Reporting", department: "Finance", document_type: "Procedure", created_at: "2025-05-20T14:38:34.506197+00:00" },
  { id: "4", name: "Customer Service Standards", department: "Marketing", document_type: "Guideline", created_at: "2025-05-20T14:38:34.506197+00:00" }
];

// Sample documents data
export const documents: DocumentRequest[] = [
  {
    id: "f74bac53-9d06-4963-b3e7-1f72667b3fdf",
    sopName: "Employee Onboarding Process",
    status: "deleted",
    isBreached: false,
    createdAt: "2025-05-20T14:55:17.956801+00:00",
    lastRevisionDate: "2025-05-20",
    nextRevisionDate: "2026-05-20",
    documentOwners: [{ id: "9d9b35a0-decb-4438-a190-8d4f51f52498", name: "James Wilson", email: "james.wilson@example.com" }],
    reviewers: [{ id: "ce8a7542-017a-4016-a178-48798a85101c", name: "Sophia Anderson", email: "sophia.anderson@example.com" }],
    documentCreators: [{ id: "47e9884e-46b3-4eed-ab69-2b23a4c90304", name: "Alex Johnson", email: "alex.johnson@example.com" }],
    complianceNames: [{ id: "d1683aa0-9851-4e29-868d-aa336f0611eb", name: "ISO 14001", email: "" }],
    department: "HR",
    country: "Global",
    documentCode: "HR-ONB-001",
    documentNumber: "HR-ONB-001",
    versionNumber: "1.0",
    documentType: "SOP",
    uploadDate: "2025-05-20",
    comments: [],
    complianceContacts: []
  },
  {
    id: "0ce012b8-eecf-4c69-9585-933562fa8f32",
    sopName: "Standard Operating Procedure for Equipment Maintenance",
    status: "live",
    isBreached: false,
    createdAt: "2025-05-20T14:55:16.683471+00:00",
    lastRevisionDate: "2025-05-20",
    nextRevisionDate: "2026-05-20",
    documentOwners: [
      { id: "9d9b35a0-decb-4438-a190-8d4f51f52498", name: "James Wilson", email: "james.wilson@example.com" },
      { id: "1747762919879", name: "Ishaq Sharif Shaikh", email: "ishaq.shaikh2013@gmail.com" }
    ],
    reviewers: [
      { id: "b3bb00c8-4c8e-4a34-8523-112c48954cc6", name: "David Lee", email: "david.lee@example.com" },
      { id: "72fb51b1-68a5-4a4e-9f51-b617993cb77d", name: "Jennifer Martinez", email: "jennifer.martinez@example.com" }
    ],
    documentCreators: [{ id: "47e9884e-46b3-4eed-ab69-2b23a4c90304", name: "Alex Johnson", email: "alex.johnson@example.com" }],
    complianceNames: [{ id: "7798bdf3-0b56-4300-86d5-8e1141f69495", name: "ISO 9001", email: "" }],
    department: "IT",
    country: "Global",
    documentCode: "IT-MAINT-001",
    documentNumber: "IT-MAINT-001",
    versionNumber: "1.0",
    documentType: "SOP",
    uploadDate: "2025-05-20",
    comments: [],
    complianceContacts: []
  },
  {
    id: "efef5de1-80b1-4535-a6b9-b7ff35028ec7",
    sopName: "Information Security Policy",
    status: "under-review",
    isBreached: false,
    createdAt: "2025-05-20T14:55:16.9391+00:00",
    lastRevisionDate: "2025-06-01",
    nextRevisionDate: "2026-06-01",
    documentOwners: [{ id: "5ee48565-5e44-4895-aea6-d3206b0cc011", name: "Sarah Johnson", email: "sarah.johnson@example.com" }],
    reviewers: [
      { id: "20df9581-b835-424a-8ddf-76b51e457216", name: "Daniel Taylor", email: "daniel.taylor@example.com" },
      { id: "ce8a7542-017a-4016-a178-48798a85101c", name: "Sophia Anderson", email: "sophia.anderson@example.com" }
    ],
    documentCreators: [{ id: "74207a4f-c145-42e9-83be-91c7387e61cb", name: "Emma Williams", email: "emma.williams@example.com" }],
    complianceNames: [{ id: "9d419c01-bb0c-4cf5-bc25-bac372725d70", name: "ISO 27001", email: "" }],
    department: "Business Process",
    country: "Bahrain",
    documentCode: "SDG-GEN-SOP-01",
    documentNumber: "SDG-GEN-SOP-01",
    versionNumber: "1.0",
    documentType: "SOP",
    uploadDate: "2025-06-01",
    comments: [],
    complianceContacts: []
  }
];

// Sample change requests
export const changeRequests: ChangeRequest[] = [
  {
    id: "39887cd3-77c0-4879-b099-7309a10a7183",
    documentId: "0ce012b8-eecf-4c69-9585-933562fa8f32",
    requestorId: "47e9884e-46b3-4eed-ab69-2b23a4c90304",
    requestorName: "Alex Johnson",
    documentName: "Standard Operating Procedure for Equipment Maintenance",
    description: "Update section 3.2 with new maintenance schedule",
    status: "pending",
    requestType: "change-request",
    changeType: "minor",
    createdAt: "2024-04-01T10:30:00+00:00",
    updatedAt: "2024-04-01T10:30:00+00:00",
    comments: ["Initial change request submitted"],
    approverName: "James Wilson",
    approverEmail: "james.wilson@example.com",
    attachmentName: "",
    attachmentUrl: "",
    documentCode: "IT-MAINT-001",
    documentType: "SOP",
    department: "IT",
    versionNumber: "1.0"
  }
];

// Document logs data
export const documentLogs = [
  {
    id: "log-1",
    documentId: "f74bac53-9d06-4963-b3e7-1f72667b3fdf",
    timestamp: "2025-05-20T14:55:17.956801+00:00",
    user: "Alex Johnson",
    action: "create",
    details: { documentName: "Employee Onboarding Process", documentCode: "HR-ONB-001" }
  }
];
