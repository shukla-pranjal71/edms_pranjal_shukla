
export const useToastNotifications = () => {
  const showSuccessToast = (title: string, description: string) => {
    // Toast notifications removed - using console.log instead
    console.log(`Success: ${title} - ${description}`);
  };

  const showErrorToast = (title: string, description: string) => {
    // Toast notifications removed - using console.log instead
    console.error(`Error: ${title} - ${description}`);
  };

  const showInfoToast = (title: string, description: string) => {
    // Toast notifications removed - using console.log instead
    console.info(`Info: ${title} - ${description}`);
  };

  const notifyDocumentStatusChange = (document: any, status: string) => {
    // Toast notifications removed - using console.log instead
    console.log(`Document status changed: ${document.sopName} - ${status}`);
  };

  const notifyDocumentError = (title: string, description: string) => {
    // Toast notifications removed - using console.log instead
    console.error(`Document Error: ${title} - ${description}`);
  };

  const notifyDocumentSuccess = (title: string, description: string) => {
    // Toast notifications removed - using console.log instead
    console.log(`Document Success: ${title} - ${description}`);
  };

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    notifyDocumentStatusChange,
    notifyDocumentError,
    notifyDocumentSuccess
  };
};
