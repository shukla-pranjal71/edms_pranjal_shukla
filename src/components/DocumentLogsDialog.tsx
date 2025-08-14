
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { documentLogService } from '@/services';
import { usePagination } from '@/components/table/hooks/usePagination';

// Updated Log interface to match the structure returned by getDocumentLogs
interface Log {
  id: string;
  document_id?: string;
  documentId?: string;
  timestamp: string;
  user_name?: string;
  user?: string;
  user_role?: string;
  action: string;
  details: any;
}

interface DocumentLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  isChangeRequest?: boolean;
  changeRequestData?: any;
}

const DocumentLogsDialog: React.FC<DocumentLogsDialogProps> = ({
  open,
  onOpenChange,
  documentId,
  isChangeRequest,
  changeRequestData
}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination hook
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginateItems
  } = usePagination(logs.length, 5);

  // Fetch logs when dialog opens
  useEffect(() => {
    if (open && documentId) {
      setIsLoading(true);
      
      const fetchLogs = async () => {
        try {
          // Fetch logs from the backend
          const documentLogs = await documentLogService.getDocumentLogs(documentId);
          
          // Map the returned logs to match our Log interface
          const mappedLogs: Log[] = Array.isArray(documentLogs) ? documentLogs.map(log => {
            // Create a properly typed log object with all required fields
            return {
              id: log.id,
              document_id: log.documentId,
              documentId: log.documentId,
              timestamp: log.timestamp,
              user_name: log.user,
              user: log.user,
              // Default to 'Unknown' if user_role is not provided in the log
              user_role: 'Unknown',
              action: log.action,
              details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
            };
          }) : [];
          
          setLogs(mappedLogs);
        } catch (error) {
          console.error('Error fetching document logs:', error);
          // Fallback to empty array if there's an error
          setLogs([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchLogs();
    }
  }, [open, documentId]);

  // Handle sorting
  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
  };

  // Sort the logs
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Get paginated logs
  const paginatedLogs = paginateItems(sortedLogs);

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Parse the details JSON string to object
  const parseDetails = (details: any): any => {
    if (typeof details === 'string') {
      try {
        return JSON.parse(details);
      } catch (e) {
        return { message: details };
      }
    }
    return details;
  };

  // Format the details for display
  const formatDetails = (log: Log): string => {
    const details = parseDetails(log.details);
    
    switch (log.action) {
      case 'create':
        return `Created document "${details.documentName}" with code ${details.documentCode}`;
      case 'update':
        return `Updated document "${details.documentName}"`;
      case 'status_change':
        return `Changed document status to "${details.newStatus}"`;
      case 'delete':
        return 'Document deleted';
      case 'archive':
        return 'Document archived';
      case 'restore':
        return details.action || 'Document restored';
      case 'query':
        return `Queried document with remarks: ${details.remarks || 'No remarks provided'}`;
      case 'review':
        return `Review completed: ${details.reviewComments || 'No comments provided'}`;
      default:
        return log.details?.message || 'Action performed on document';
    }
  };

  // Get action color based on action type
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'status_change':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'archive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'restore':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'approve':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'query':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Document Activity Logs</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleSort} className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              Sort {sortDirection === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-60">
            <p className="text-muted-foreground">No activity logs found for this document.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {paginatedLogs.map(log => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user_name || log.user}</span>
                        <span className="text-xs text-muted-foreground">{log.user_role || 'User'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <p className="text-sm text-muted-foreground">{formatDetails(log)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} entries
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentLogsDialog;
