import {
  BaseDocumentRequest,
  DocumentStatus,
  UserRole,
} from "../components/table/DocumentTableTypes";
import { ChangeRequest } from "../components/ChangeRequestForm";

const API_BASE_URL = "http://localhost:3001/api";

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Document API
export const documentAPI = {
  // Get all documents with pagination and filtering
  getDocuments: async (params: {
    page?: number;
    limit?: number;
    status?: DocumentStatus;
    department?: string;
    country?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest<{
      documents: BaseDocumentRequest[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/documents?${searchParams.toString()}`);
  },

  // Get single document by ID
  getDocument: async (id: string) => {
    return apiRequest<BaseDocumentRequest>(`/documents/${id}`);
  },

  // Create new document
  createDocument: async (document: Partial<BaseDocumentRequest>) => {
    return apiRequest<{
      message: string;
      documentId: string;
      document: BaseDocumentRequest;
    }>("/documents", {
      method: "POST",
      body: JSON.stringify(document),
    });
  },

  // Update document
  updateDocument: async (id: string, updates: Partial<BaseDocumentRequest>) => {
    return apiRequest<{
      message: string;
      document: BaseDocumentRequest;
    }>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Delete document (soft delete)
  deleteDocument: async (id: string) => {
    return apiRequest<{ message: string }>(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  // Get document logs
  getDocumentLogs: async (id: string) => {
    return apiRequest<
      Array<{
        id: number;
        document_id: string;
        user_id: string;
        action: string;
        details: string;
        timestamp: string;
        user_name: string;
      }>
    >(`/documents/${id}/logs`);
  },

  // Add comment to document
  addComment: async (documentId: string, userId: string, comment: string) => {
    return apiRequest<{ message: string }>(
      `/documents/${documentId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ userId, comment }),
      }
    );
  },
};

// User API
export const userAPI = {
  // Get all users with optional filtering
  getUsers: async (params?: { role?: UserRole; department?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiRequest<
      Array<{
        id: string;
        name: string;
        email: string;
        role: UserRole;
        department: string;
        country: string;
        created_at: string;
        updated_at: string;
      }>
    >(`/users?${searchParams.toString()}`);
  },
};

// Reference Data API
export const referenceAPI = {
  // Get countries
  getCountries: async () => {
    return apiRequest<
      Array<{
        id: number;
        name: string;
        created_at: string;
      }>
    >("/countries");
  },

  // Get departments
  getDepartments: async () => {
    return apiRequest<
      Array<{
        id: number;
        name: string;
        approver_name: string;
        approver_email: string;
        created_at: string;
      }>
    >("/departments");
  },

  // Get document types
  getDocumentTypes: async () => {
    return apiRequest<
      Array<{
        id: number;
        name: string;
        department: string;
        created_at: string;
      }>
    >("/document-types");
  },
};

// Change Request API
export const changeRequestAPI = {
  // Get all change requests with optional filtering
  getChangeRequests: async (params?: {
    status?: string;
    documentId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiRequest<
      Array<
        ChangeRequest & {
          document_name: string;
          requester_name: string;
        }
      >
    >(`/change-requests?${searchParams.toString()}`);
  },

  // Create new change request
  createChangeRequest: async (changeRequest: {
    documentId: string;
    requesterId: string;
    requestType: string;
    description: string;
    priority: string;
  }) => {
    return apiRequest<{
      message: string;
      changeRequestId: string;
    }>("/change-requests", {
      method: "POST",
      body: JSON.stringify(changeRequest),
    });
  },

  // Update change request status
  updateChangeRequestStatus: async (id: string, status: string) => {
    return apiRequest<{ message: string }>(`/change-requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    return apiRequest<{
      totalDocuments: number;
      liveDocuments: number;
      underReview: number;
      pendingApproval: number;
      archivedDocuments: number;
      totalUsers: number;
      pendingChangeRequests: number;
    }>("/dashboard/stats");
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest<{ status: string; timestamp: string }>("/health");
  },
};

// Export all APIs
export const apiService = {
  documents: documentAPI,
  users: userAPI,
  reference: referenceAPI,
  changeRequests: changeRequestAPI,
  dashboard: dashboardAPI,
  health: healthAPI,
};
