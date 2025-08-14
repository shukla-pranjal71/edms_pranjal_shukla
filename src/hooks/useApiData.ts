import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/apiService";
import {
  BaseDocumentRequest,
  DocumentStatus,
  UserRole,
} from "../components/table/DocumentTableTypes";
import { ChangeRequest } from "../components/ChangeRequestForm";

// Document hooks
export const useDocuments = (params: {
  page?: number;
  limit?: number;
  status?: DocumentStatus;
  department?: string;
  country?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => apiService.documents.getDocuments(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => apiService.documents.getDocument(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (document: Partial<BaseDocumentRequest>) =>
      apiService.documents.createDocument(document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BaseDocumentRequest>;
    }) => apiService.documents.updateDocument(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.documents.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useDocumentLogs = (id: string) => {
  return useQuery({
    queryKey: ["document-logs", id],
    queryFn: () => apiService.documents.getDocumentLogs(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      userId,
      comment,
    }: {
      documentId: string;
      userId: string;
      comment: string;
    }) => apiService.documents.addComment(documentId, userId, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["document-logs", variables.documentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["document", variables.documentId],
      });
    },
  });
};

// User hooks
export const useUsers = (params?: { role?: UserRole; department?: string }) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => apiService.users.getUsers(params),
    staleTime: 300000, // 5 minutes
  });
};

// Reference data hooks
export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => apiService.reference.getCountries(),
    staleTime: 600000, // 10 minutes
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => apiService.reference.getDepartments(),
    staleTime: 600000, // 10 minutes
  });
};

export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ["document-types"],
    queryFn: () => apiService.reference.getDocumentTypes(),
    staleTime: 600000, // 10 minutes
  });
};

// Change request hooks
export const useChangeRequests = (params?: {
  status?: string;
  documentId?: string;
}) => {
  return useQuery({
    queryKey: ["change-requests", params],
    queryFn: () => apiService.changeRequests.getChangeRequests(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeRequest: {
      documentId: string;
      requesterId: string;
      requestType: string;
      description: string;
      priority: string;
    }) => apiService.changeRequests.createChangeRequest(changeRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
  });
};

export const useUpdateChangeRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.changeRequests.updateChangeRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiService.dashboard.getStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiService.health.check(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

// Custom hook for managing API connection status
export const useApiConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const healthCheck = useHealthCheck();

  useEffect(() => {
    if (healthCheck.data) {
      setIsConnected(true);
      setLastCheck(new Date());
    } else if (healthCheck.error) {
      setIsConnected(false);
    }
  }, [healthCheck.data, healthCheck.error]);

  const checkConnection = useCallback(async () => {
    try {
      await apiService.health.check();
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
    }
  }, []);

  return {
    isConnected,
    lastCheck,
    checkConnection,
    isLoading: healthCheck.isLoading,
    error: healthCheck.error,
  };
};
