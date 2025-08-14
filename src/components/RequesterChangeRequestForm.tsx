
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { countryService } from '@/services/countryService';
import { departmentService } from '@/services/departmentService';
import { documentTypeService } from '@/services/documentTypeService';
import PeopleField, { Person } from './PeopleField';
import DocumentNameSelector from './DocumentNameSelector';
import ComplianceContactSelector from './ComplianceContactSelector';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { ChangeRequest, ChangeRequestStatus } from './ChangeRequestForm';

interface RequesterChangeRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Partial<ChangeRequest>) => void;
  documents: BaseDocumentRequest[];
}

const RequesterChangeRequestForm: React.FC<RequesterChangeRequestFormProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  documents 
}) => {
  // Form state
  const [documentType, setDocumentType] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [requestType, setRequestType] = useState<'new-request' | 'change-request'>('new-request');
  const [changeType, setChangeType] = useState<'major' | 'minor'>('minor');
  const [documentCode, setDocumentCode] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [description, setDescription] = useState('');
  const [taskOwners, setTaskOwners] = useState<Person[]>([]);
  const [reviewers, setReviewers] = useState<Person[]>([]);
  const [complianceContacts, setComplianceContacts] = useState<Person[]>([]);

  // Data state
  const [countries, setCountries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  // Load data from services
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, departmentsData, documentTypesData] = await Promise.all([
          countryService.getAllCountries(),
          departmentService.getAllDepartments(),
          documentTypeService.getAllDocumentTypes()
        ]);
        
        setCountries(countriesData);
        setDepartments(departmentsData);
        setDocumentTypes(documentTypesData);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Auto-generate document code when department, document type, and document name change
  useEffect(() => {
    if (department && documentType && documentName) {
      generateDocumentCode();
    }
  }, [department, documentType, documentName]);

  // Auto-generate version number when document code and request type change
  useEffect(() => {
    if (documentCode && requestType) {
      generateVersionNumber();
    }
  }, [documentCode, requestType, changeType]);

  const generateDocumentCode = () => {
    if (!department || !documentType) return;
    
    const deptAbbr = department.substring(0, 3).toUpperCase();
    let typeAbbr = '';
    
    switch (documentType.toLowerCase()) {
      case 'sop':
        typeAbbr = 'SOP';
        break;
      case 'policy':
        typeAbbr = 'POL';
        break;
      case 'work instruction':
        typeAbbr = 'WI';
        break;
      case 'form':
        typeAbbr = 'FORM';
        break;
      default:
        typeAbbr = documentType.substring(0, 3).toUpperCase();
    }
    
    const generatedCode = `SDG-${deptAbbr}-${typeAbbr}-01`;
    setDocumentCode(generatedCode);
  };

  const generateVersionNumber = () => {
    if (!documentCode) return;
    
    // Find documents with the same document code
    const matchingDocs = documents.filter(doc => doc.documentCode === documentCode);
    
    if (matchingDocs.length === 0) {
      setVersionNumber('1.0');
      return;
    }
    
    // Find the highest version number
    let highestVersion = 0;
    matchingDocs.forEach(doc => {
      const version = parseFloat(doc.versionNumber || '0');
      if (!isNaN(version) && version > highestVersion) {
        highestVersion = version;
      }
    });
    
    let newVersion = '';
    if (requestType === 'new-request') {
      setVersionNumber('1.0');
    } else if (requestType === 'change-request') {
      if (changeType === 'major') {
        // Major change: increment major version, reset minor to 0
        const majorPart = Math.floor(highestVersion) + 1;
        newVersion = `${majorPart}.0`;
      } else {
        // Minor change: increment minor version by 0.1
        const majorPart = Math.floor(highestVersion);
        const minorPart = Math.round((highestVersion - majorPart) * 10) / 10;
        newVersion = `${majorPart}.${Math.round((minorPart + 0.1) * 10) / 10}`;
      }
      setVersionNumber(newVersion);
    }
  };

  const handleComplianceContactsChange = (contacts: any[]) => {
    // Convert to Person format for compatibility
    const people: Person[] = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email
    }));
    setComplianceContacts(people);
  };

  const handleSubmit = () => {
    if (!documentType || !department || !country || !documentName || !description) {
      console.error("Missing required fields");
      return;
    }

    onSubmit({
      documentId: uuidv4(),
      documentName,
      documentType,
      department,
      country,
      documentCode,
      versionNumber,
      requestType,
      changeType: requestType === 'change-request' ? changeType : undefined,
      description,
      taskOwners,
      reviewers,
      complianceContacts,
      // Legacy fields for backward compatibility
      approverName: taskOwners.length > 0 ? taskOwners[0].name : '',
      approverEmail: taskOwners.length > 0 ? taskOwners[0].email : ''
    });

    onOpenChange(false);
    clearForm();
  };

  const clearForm = () => {
    setDocumentType('');
    setDepartment('');
    setCountry('');
    setDocumentName('');
    setRequestType('new-request');
    setChangeType('minor');
    setDocumentCode('');
    setVersionNumber('');
    setDescription('');
    setTaskOwners([]);
    setReviewers([]);
    setComplianceContacts([]);
  };

  // Convert data to searchable select options
  const documentTypeOptions: SearchableSelectOption[] = documentTypes.map(type => ({
    value: type.name,
    label: type.name
  }));

  const departmentOptions: SearchableSelectOption[] = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }));

  const countryOptions: SearchableSelectOption[] = countries.map(country => ({
    value: country.name,
    label: country.name
  }));

  const requestTypeOptions: SearchableSelectOption[] = [
    { value: 'new-request', label: 'New Request' },
    { value: 'change-request', label: 'Change Request' }
  ];

  const changeTypeOptions: SearchableSelectOption[] = [
    { value: 'major', label: 'Major Change' },
    { value: 'minor', label: 'Minor Change' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Change Request</DialogTitle>
          <DialogDescription>
            Submit a change request for a new or existing document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="documentType">Document Type *</Label>
              <SearchableSelect
                options={documentTypeOptions}
                value={documentType}
                onValueChange={setDocumentType}
                placeholder="Select document type"
                searchPlaceholder="Search document types..."
                emptyMessage="No document types found."
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <SearchableSelect
                options={departmentOptions}
                value={department}
                onValueChange={setDepartment}
                placeholder="Select department"
                searchPlaceholder="Search departments..."
                emptyMessage="No departments found."
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <SearchableSelect
              options={countryOptions}
              value={country}
              onValueChange={setCountry}
              placeholder="Select country"
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found."
              className="h-9"
            />
          </div>

          <div>
            <DocumentNameSelector 
              value={documentName}
              onChange={setDocumentName}
              placeholder="Enter document name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="requestType">Request Type *</Label>
              <SearchableSelect
                options={requestTypeOptions}
                value={requestType}
                onValueChange={(value) => setRequestType(value as 'new-request' | 'change-request')}
                placeholder="Select request type"
                searchPlaceholder="Search request types..."
                emptyMessage="No request types found."
                className="h-9"
              />
            </div>
            {requestType === 'change-request' && (
              <div>
                <Label htmlFor="changeType">Change Type *</Label>
                <SearchableSelect
                  options={changeTypeOptions}
                  value={changeType}
                  onValueChange={(value) => setChangeType(value as 'major' | 'minor')}
                  placeholder="Select change type"
                  searchPlaceholder="Search change types..."
                  emptyMessage="No change types found."
                  className="h-9"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="documentCode">Document Code</Label>
              <Input
                type="text"
                id="documentCode"
                value={documentCode}
                onChange={(e) => setDocumentCode(e.target.value)}
                placeholder="Auto-generated"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="versionNumber">Version Number</Label>
              <Input
                type="text"
                id="versionNumber"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="Auto-generated"
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the change request"
              className="resize-none min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="taskOwners">Task Owners</Label>
            <PeopleField
              people={taskOwners}
              onChange={setTaskOwners}
              placeholder="Add task owners..."
            />
          </div>

          <div>
            <Label htmlFor="reviewers">Reviewers</Label>
            <PeopleField
              people={reviewers}
              onChange={setReviewers}
              placeholder="Add reviewers..."
            />
          </div>

          <div>
            <ComplianceContactSelector 
              value={complianceContacts.map(c => c.id)} 
              onChange={handleComplianceContactsChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => { clearForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequesterChangeRequestForm;
