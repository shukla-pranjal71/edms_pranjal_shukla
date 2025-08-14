import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from 'lucide-react';
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { countryService } from '@/services/countryService';
import { departmentService } from '@/services/departmentService';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { MultiSelectChips } from '@/components/MultiSelectChips';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'pending-owner-approval';
export interface ChangeRequest {
  id: string;
  documentId: string;
  documentName: string;
  requestType: 'new-request' | 'change-request';
  changeType?: 'major' | 'minor';
  description: string;
  status: ChangeRequestStatus;
  createdAt: string;
  updatedAt: string;
  requestorId: string;
  requestorName: string;
  approverName?: string;
  approverEmail?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  comments?: string[];
  documentCode?: string;
  documentType?: string;
  department?: string;
  versionNumber?: string;
  country?: string;
  approvers?: Person[];
  taskOwners?: Person[];
  reviewers?: Person[];
  complianceContacts?: Person[];
  documentOwnerEmails?: string[];
  pointOfContactEmails?: string[];
  attachments?: File[];
}
interface Person {
  name: string;
  email: string;
  id: string;
}
interface ChangeRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Partial<ChangeRequest>, attachment?: File) => void;
  documents: BaseDocumentRequest[];
  embedded?: boolean;
}
const ChangeRequestForm: React.FC<ChangeRequestFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  documents,
  embedded = false
}) => {
  // Form state
  const [departments, setDepartments] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [documentOwnerEmails, setDocumentOwnerEmails] = useState<string[]>(['']);
  const [pointOfContactEmails, setPointOfContactEmails] = useState<string[]>(['']);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Data state
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);

  // Load data from services
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, departmentsData] = await Promise.all([countryService.getAllCountries(), departmentService.getAllDepartments()]);
        setAvailableCountries(countriesData);
        setAvailableDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    if (open) {
      loadData();
    }
  }, [open]);

  // Filter live documents based on selected countries and departments
  const getFilteredDocuments = (): SearchableSelectOption[] => {
    if (!documents) return [];
    return documents.filter(doc => doc.status === 'live') // Only live documents
    .filter(doc => {
      // Filter by countries if any selected
      if (countries.length > 0 && !countries.includes('all') && doc.country && !countries.includes(doc.country)) {
        return false;
      }
      // Filter by departments if any selected
      if (departments.length > 0 && !departments.includes('all') && doc.department && !departments.includes(doc.department)) {
        return false;
      }
      return true;
    }).map(doc => ({
      value: doc.sopName || '',
      label: doc.sopName || ''
    }));
  };
  const handleAddDocumentOwnerEmail = () => {
    setDocumentOwnerEmails([...documentOwnerEmails, '']);
  };
  const handleRemoveDocumentOwnerEmail = (index: number) => {
    if (documentOwnerEmails.length > 1) {
      const updated = documentOwnerEmails.filter((_, i) => i !== index);
      setDocumentOwnerEmails(updated);
    }
  };
  const handleDocumentOwnerEmailChange = (index: number, value: string) => {
    const updated = [...documentOwnerEmails];
    updated[index] = value;
    setDocumentOwnerEmails(updated);
  };
  const handleAddPointOfContactEmail = () => {
    setPointOfContactEmails([...pointOfContactEmails, '']);
  };
  const handleRemovePointOfContactEmail = (index: number) => {
    if (pointOfContactEmails.length > 1) {
      const updated = pointOfContactEmails.filter((_, i) => i !== index);
      setPointOfContactEmails(updated);
    }
  };
  const handlePointOfContactEmailChange = (index: number, value: string) => {
    const updated = [...pointOfContactEmails];
    updated[index] = value;
    setPointOfContactEmails(updated);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };
  const handleRemoveAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
  };
  const handleSubmit = () => {
    if (departments.length === 0 || countries.length === 0 || !documentName || !description) {
      console.error("Missing required fields");
      return;
    }
    onSubmit({
      documentId: uuidv4(),
      documentName,
      department: departments.join(', '),
      // Convert array to string for backward compatibility
      country: countries.join(', '),
      // Convert array to string for backward compatibility
      requestType: 'change-request',
      description,
      documentOwnerEmails: documentOwnerEmails.filter(email => email.trim() !== ''),
      pointOfContactEmails: pointOfContactEmails.filter(email => email.trim() !== ''),
      attachments
    }, attachments[0]); // Pass first attachment for backward compatibility

    onOpenChange(false);
    clearForm();
  };
  const clearForm = () => {
    setDepartments([]);
    setCountries([]);
    setDocumentName('');
    setDescription('');
    setDocumentOwnerEmails(['']);
    setPointOfContactEmails(['']);
    setAttachments([]);
  };

  // Convert data to multi-select options
  const departmentOptions = availableDepartments.map(dept => dept.name);
  const countryOptions = availableCountries.map(country => country.name);
  const documentOptions = getFilteredDocuments();
  const FormContent = () => <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <MultiSelectChips options={departmentOptions} value={departments} onChange={setDepartments} label="Department *" placeholder="Select departments" />
          </div>
          <div>
            <MultiSelectChips options={countryOptions} value={countries} onChange={setCountries} label="Country *" placeholder="Select countries" />
          </div>
        </div>

        <div>
          <Label htmlFor="documentName">Document Name *</Label>
          <SearchableSelect options={documentOptions} value={documentName} onValueChange={setDocumentName} placeholder="Select document name" searchPlaceholder="Search document names..." emptyMessage="No live documents found for the selected filters." className="h-9" />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the request" className="resize-none min-h-[80px]" />
        </div>

        <div>
          <Label>Document Owner Emails *</Label>
          {documentOwnerEmails.map((email, index) => <div key={index} className="flex gap-2 mb-2">
              <Input type="email" value={email} onChange={e => handleDocumentOwnerEmailChange(index, e.target.value)} placeholder="Enter document owner email" />
              {documentOwnerEmails.length > 1 && <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveDocumentOwnerEmail(index)}>
                  <X className="h-4 w-4" />
                </Button>}
            </div>)}
          
        </div>

        <div>
          <Label>Point of Contact Emails</Label>
          {pointOfContactEmails.map((email, index) => <div key={index} className="flex gap-2 mb-2">
              <Input type="email" value={email} onChange={e => handlePointOfContactEmailChange(index, e.target.value)} placeholder="Enter point of contact email" />
              {pointOfContactEmails.length > 1 && <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePointOfContactEmail(index)}>
                  <X className="h-4 w-4" />
                </Button>}
            </div>)}
          <Button type="button" variant="outline" onClick={handleAddPointOfContactEmail} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Point of Contact Email
          </Button>
        </div>

        <div>
          <Label htmlFor="attachments">Attachments (Documents or Images) *</Label>
          <Input type="file" id="attachments" multiple onChange={handleFileChange} className="mb-2" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" />
          {attachments.length > 0 && <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Files:</Label>
              {attachments.map((file, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAttachment(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>)}
            </div>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={() => {
        clearForm();
        if (!embedded) onOpenChange(false);
      }}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} className="bg-[tra#117bbct] bg-[#117bbc] text-slate-50">
          Submit Change Request
        </Button>
      </DialogFooter>
    </>;
  if (embedded) {
    return <FormContent />;
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Request</DialogTitle>
          <DialogDescription>
            Request changes to an existing document or process.
          </DialogDescription>
        </DialogHeader>
        
        <FormContent />
      </DialogContent>
    </Dialog>;
};
export default ChangeRequestForm;