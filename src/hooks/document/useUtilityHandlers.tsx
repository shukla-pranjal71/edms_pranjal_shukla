
import { AdminConfig } from '@/components/AdminConfigDialog';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';
import { exportToExcel } from '@/utils/exportUtils';
import { generateCommentData, generatePersonData, generateDocumentCodeData } from '@/data/syntheticData';
import { notificationService } from '@/utils/notificationService';

export const useUtilityHandlers = () => {
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };
  
  // Handle filter selection - update to match Dashboard's expected function signature
  const handleFilterClick = (filter: string, currentFilter?: string | null): void => {
    // Function now takes just one required parameter and returns void
    // The implementation in Dashboard will handle the toggling logic
    console.log(`Filter clicked: ${filter}, current filter: ${currentFilter}`);
    // This function intentionally doesn't return anything (void)
    // as Dashboard component handles setting the state
  };
  
  // Save admin configuration settings
  const handleSaveAdminConfig = (config: AdminConfig): AdminConfig => {
    console.log("Saving admin config:", config);
    // In a real app, this would save to a service/API
    return config;
  };
  
  // Export documents to Excel
  const handleExport = (documents: BaseDocumentRequest[]) => {
    exportToExcel(documents, 'documents');
  };
  
  // Utility functions for generating sample data
  const generateRandomPerson = () => {
    return generatePersonData();
  };
  
  const generateDocumentCode = () => {
    return generateDocumentCodeData();
  };
  
  const generateComment = () => {
    return generateCommentData();
  };
  
  // Function to check for documents needing review notifications
  // This now delegates to the notification service and takes no arguments
  const checkAndSendReviewNotifications = () => {
    console.log("Checking for document reviews that need notifications");
    notificationService.checkAndSendReviewNotifications();
  };

  return {
    handleLogout,
    handleFilterClick,
    handleSaveAdminConfig,
    handleExport,
    generateRandomPerson,
    generateDocumentCode,
    generateComment,
    checkAndSendReviewNotifications
  };
};
