
import * as XLSX from 'xlsx';
import { BaseDocumentRequest } from '@/components/table/DocumentTableTypes';

/**
 * Converts document data to an Excel file and triggers download
 */
export function exportToExcel(documents: BaseDocumentRequest[], filename: string = 'document-list') {
  if (!documents || documents.length === 0) {
    return;
  }

  // Process document data to make it Excel-friendly
  const data = documents.map(doc => ({
    'Document Code': doc.documentCode,
    'Document Name': doc.sopName,
    'Document Owner': doc.documentOwners.map(owner => owner.name).join(', '),
    'Reviewers': doc.reviewers.map(reviewer => reviewer.name).join(', '),
    'Country': doc.country,
    'Last Revision': doc.lastRevisionDate,
    'Next Revision': doc.nextRevisionDate,
    'Version Number': doc.versionNumber,
    'Status': doc.status,
    'Upload Date': doc.uploadDate,
    'Compliance': doc.complianceNames ? doc.complianceNames.join(', ') : ''
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents');

  // Generate and download Excel file
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  XLSX.writeFile(workbook, `${filename}-${currentDate}.xlsx`);
}
