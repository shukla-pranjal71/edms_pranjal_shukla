
// Toast notifications have been removed - using console.log instead
export const useToastNotifications = () => {
  const showSuccessToast = (title: string, description?: string) => {
    console.log(`Success: ${title}${description ? ` - ${description}` : ''}`);
  };

  const showErrorToast = (title: string, description?: string) => {
    console.error(`Error: ${title}${description ? ` - ${description}` : ''}`);
  };

  const showInfoToast = (title: string, description?: string) => {
    console.info(`Info: ${title}${description ? ` - ${description}` : ''}`);
  };

  const notifyDocumentStatusChange = (document: any, status: string) => {
    console.log(`Document status changed: ${document.sopName} - ${status}`);
  };

  const notifyDocumentError = (title: string, description: string) => {
    console.error(`Document Error: ${title} - ${description}`);
  };

  const notifyDocumentSuccess = (title: string, description: string) => {
    console.log(`Document Success: ${title} - ${description}`);
  };

  return {
    notifyDocumentStatusChange,
    notifyDocumentError,
    notifyDocumentSuccess,
    showSuccessToast,
    showErrorToast,
    showInfoToast
  };
};
