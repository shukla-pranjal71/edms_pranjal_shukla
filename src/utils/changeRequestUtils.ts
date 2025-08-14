
/**
 * Generate a document code based on department and document type
 * 
 * @param department The department name
 * @param documentType The type of document (SOP, Policy, Workflow)
 * @returns The generated document code
 */
export const generateDocumentCode = (department: string, documentType: string) => {
  // Get first 3 letters of department
  const deptPrefix = department.substring(0, 3).toUpperCase();

  // Determine type prefix
  let typePrefix = "";
  if (documentType === "SOP") typePrefix = "SOP";
  else if (documentType === "Policy") typePrefix = "POL";
  else if (documentType === "Workflow") typePrefix = "WRK";

  // Generate document code
  return `SDG-${deptPrefix}-${typePrefix}-01`;
};

/**
 * Calculate the next version number based on the document code, request type, and existing documents
 * 
 * @param documentCode The document code
 * @param requestType The type of change request ('minor' or 'major')
 * @param documents Array of existing documents to check for version numbers
 * @returns The calculated next version number
 */
export const calculateVersionNumber = (documentCode: string, requestType: 'minor' | 'major', documents: any[] = []) => {
  // Find documents with the same document code
  const matchingDocs = documents.filter(doc => doc.documentCode === documentCode);
  
  if (matchingDocs.length === 0) {
    // No existing documents with this code, start with version 1.0
    return "1.0";
  }
  
  // Extract version numbers and find the highest one
  const versions = matchingDocs.map(doc => {
    const versionNum = parseFloat(doc.versionNumber || '0');
    return isNaN(versionNum) ? 0 : versionNum;
  });
  
  const highestVersion = Math.max(...versions);
  
  if (requestType === 'minor') {
    // For minor changes, increment by 0.1
    return (Math.floor(highestVersion * 10) / 10 + 0.1).toFixed(1);
  } else {
    // For major changes, increment to the next whole number
    const currentMajor = Math.floor(highestVersion);
    return `${currentMajor + 1}.0`;
  }
};
