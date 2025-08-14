import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from 'lucide-react';
import CountrySelector from './CountrySelector';
import DepartmentSelector from './DepartmentSelector';
import { UploadButton } from './uploadButton';
export interface NewRequest {
  id: string;
  countries: string[];
  departments: string[];
  documentName: string;
  documentOwners: {
    name: string;
    email: string;
  }[];
  pointOfContactEmails: string[];
  description: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'pending-owner-approval';
  createdAt: string;
  updatedAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
}
interface NewRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Partial<NewRequest>, attachment?: File) => void;
  embedded?: boolean;
}
const NewRequestForm: React.FC<NewRequestFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  embedded = false
}) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [documentOwners, setDocumentOwners] = useState<{
    name: string;
    email: string;
  }[]>([{
    name: '',
    email: ''
  }]);
  const [pointOfContactEmails, setPointOfContactEmails] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const handleAddDocumentOwner = () => {
    setDocumentOwners([...documentOwners, {
      name: '',
      email: ''
    }]);
  };
  const handleRemoveDocumentOwner = (index: number) => {
    if (documentOwners.length > 1) {
      const updated = documentOwners.filter((_, i) => i !== index);
      setDocumentOwners(updated);
    }
  };
  const handleDocumentOwnerChange = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...documentOwners];
    updated[index][field] = value;
    setDocumentOwners(updated);
  };
  const handleAddPointOfContact = () => {
    setPointOfContactEmails([...pointOfContactEmails, '']);
  };
  const handleRemovePointOfContact = (index: number) => {
    if (pointOfContactEmails.length > 1) {
      const updated = pointOfContactEmails.filter((_, i) => i !== index);
      setPointOfContactEmails(updated);
    }
  };
  const handlePointOfContactChange = (index: number, value: string) => {
    const updated = [...pointOfContactEmails];
    updated[index] = value;
    setPointOfContactEmails(updated);
  };
  const handleFileSelected = (file: File) => {
    console.log('File selected:', file.name);
    setAttachment(file);
  };
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    console.log('New Request Form submission started');
    console.log('Description value:', description);

    // Validate required fields
    if (!documentName.trim()) {
      console.error("Document name is required");
      alert("Document name is required");
      return;
    }
    if (!description.trim()) {
      console.error("Description is required");
      alert("Description is required");
      return;
    }
    if (countries.length === 0) {
      console.error("At least one country is required");
      alert("At least one country is required");
      return;
    }
    if (departments.length === 0) {
      console.error("At least one department is required");
      alert("At least one department is required");
      return;
    }

    // Validate document owners - at least one complete owner required
    const validDocumentOwners = documentOwners.filter(owner => owner.name.trim() !== '' && owner.email.trim() !== '');
    if (validDocumentOwners.length === 0) {
      console.error("At least one complete document owner (name and email) is required");
      alert("At least one complete document owner (name and email) is required");
      return;
    }
    const newRequest: Partial<NewRequest> = {
      countries,
      departments,
      documentName: documentName.trim(),
      documentOwners: validDocumentOwners,
      pointOfContactEmails: pointOfContactEmails.filter(email => email.trim() !== ''),
      description: description.trim(),
      status: 'draft',
      attachmentName: attachment?.name
    };
    console.log('Submitting new request:', newRequest);
    console.log('With attachment:', attachment);
    onSubmit(newRequest, attachment || undefined);
    clearForm();
    if (!embedded) {
      onOpenChange(false);
    }
  };
  const clearForm = () => {
    setCountries([]);
    setDepartments([]);
    setDocumentName('');
    setDocumentOwners([{
      name: '',
      email: ''
    }]);
    setPointOfContactEmails(['']);
    setDescription('');
    setAttachment(null);
  };
  const handleCancel = () => {
    clearForm();
    if (!embedded) {
      onOpenChange(false);
    }
  };
  const FormContent = () => <div className="grid gap-4 py-4">
      <div>
        <Label htmlFor="countries">Countries *</Label>
        <CountrySelector value={countries} onChange={value => setCountries(Array.isArray(value) ? value : [value])} multiSelect={true} label="" />
      </div>

      <div>
        <Label htmlFor="departments">Departments *</Label>
        <DepartmentSelector value={departments} onChange={value => setDepartments(Array.isArray(value) ? value : [value])} multiSelect={true} label="" />
      </div>

      <div>
        <Label htmlFor="documentName">Document Name *</Label>
        <Input id="documentName" value={documentName} onChange={e => setDocumentName(e.target.value)} placeholder="Enter document name" />
      </div>

      <div>
        <Label>Document Owners *</Label>
        {documentOwners.map((owner, index) => <div key={index} className="flex gap-2 mb-2">
            
            <Input type="email" placeholder="Owner email" value={owner.email} onChange={e => handleDocumentOwnerChange(index, 'email', e.target.value)} />
            {documentOwners.length > 1 && <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveDocumentOwner(index)}>
                <X className="h-4 w-4" />
              </Button>}
          </div>)}
        
      </div>

      <div>
        <Label>Point of Contact Emails</Label>
        {pointOfContactEmails.map((email, index) => <div key={index} className="flex gap-2 mb-2">
            <Input type="email" value={email} onChange={e => handlePointOfContactChange(index, e.target.value)} placeholder="Enter point of contact email" />
            {pointOfContactEmails.length > 1 && <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePointOfContact(index)}>
                <X className="h-4 w-4" />
              </Button>}
          </div>)}
        <Button type="button" variant="outline" onClick={handleAddPointOfContact} className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Add Point of Contact
        </Button>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" value={description} onChange={e => {
        console.log('Description changing to:', e.target.value);
        setDescription(e.target.value);
      }} placeholder="Detailed description of the request" className="resize-none min-h-[100px]" />
      </div>

      <div>
        <Label>Document Attachment</Label>
        <div className="flex items-center gap-2 mt-2">
          <UploadButton onFileSelected={handleFileSelected} acceptDocuments={true} acceptImages={true} label="Choose File" className="w-auto" />
          {attachment && <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{attachment.name}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setAttachment(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Optional: Upload supporting documents (PDF, DOC, DOCX, images)
        </p>
      </div>
    </div>;
  const FormActions = () => <DialogFooter>
      <Button type="button" variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button type="button" onClick={handleSubmit} className="bg-[in_this_form_remove_the_field_to_enter_document_owner's_name] bg-[#117bbc] text-slate-50">
        Submit Request
      </Button>
    </DialogFooter>;
  if (embedded) {
    return <form onSubmit={handleSubmit}>
        <FormContent />
        <FormActions />
      </form>;
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FormContent />
          <FormActions />
        </form>
      </DialogContent>
    </Dialog>;
};
export default NewRequestForm;