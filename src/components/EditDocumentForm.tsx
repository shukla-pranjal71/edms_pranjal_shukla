import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DocumentRequest } from './DocumentRequestForm';
import PeopleField, { Person } from './PeopleField';
import CountrySelector from './CountrySelector';
import DepartmentSelector from './DepartmentSelector';
import { documentService } from '../services/documentService';
interface EditDocumentFormProps {
  document: DocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedDocument: DocumentRequest) => void;
}
const documentTypes = ["SOP", "Policy", "Work Instruction", "Form", "Template", "Guideline"];
const EditDocumentForm: React.FC<EditDocumentFormProps> = ({
  document,
  open,
  onOpenChange,
  onSave
}) => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<DocumentRequest>(document);
  const [lastRevDate, setLastRevDate] = useState<Date | undefined>(document.lastRevisionDate ? new Date(document.lastRevisionDate) : undefined);
  const [nextRevDate, setNextRevDate] = useState<Date | undefined>(document.nextRevisionDate ? new Date(document.nextRevisionDate) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [nextDateError, setNextDateError] = useState<string>('');
  useEffect(() => {
    if (open) {
      setFormData(document);
      setLastRevDate(document.lastRevisionDate ? new Date(document.lastRevisionDate) : undefined);
      setNextRevDate(document.nextRevisionDate ? new Date(document.nextRevisionDate) : undefined);
      setNextDateError('');
    }
  }, [document, open]);

  // Auto-calculate next revision date when last revision date changes
  const calculateNextRevisionDate = (lastDate: Date): Date => {
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);
    return nextDate;
  };

  // Validate if next revision date is at least 3 months after last revision date
  const validateNextRevisionDate = (lastDate: Date, nextDate: Date): boolean => {
    const minNextDate = calculateNextRevisionDate(lastDate);
    return nextDate >= minNextDate;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCountryChange = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country
    }));
  };
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({
      ...prev,
      department
    }));
  };
  const handleLastRevDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setLastRevDate(date);
    setNextDateError('');
    if (date) {
      // Auto-calculate and set next revision date to 3 months later
      const calculatedNextDate = calculateNextRevisionDate(date);
      setNextRevDate(calculatedNextDate);
      setFormData(prev => ({
        ...prev,
        lastRevisionDate: date.toISOString().split('T')[0],
        nextRevisionDate: calculatedNextDate.toISOString().split('T')[0]
      }));
    }
  };
  const handleNextRevDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    if (date && lastRevDate) {
      // Validate that next revision date is at least 3 months after last revision date
      if (!validateNextRevisionDate(lastRevDate, date)) {
        const minDate = calculateNextRevisionDate(lastRevDate);
        setNextDateError(`Next revision date must be at least 3 months after the last revision date (minimum: ${minDate.toISOString().split('T')[0]})`);
        return;
      }
    }
    setNextDateError('');
    setNextRevDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        nextRevisionDate: date.toISOString().split('T')[0]
      }));
    }
  };
  const handlePeopleChange = (people: Person[], field: 'documentOwners' | 'reviewers' | 'complianceNames' | 'documentCreators') => {
    setFormData(prev => ({
      ...prev,
      [field]: people
    }));
  };
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates before submission
    if (lastRevDate && nextRevDate && !validateNextRevisionDate(lastRevDate, nextRevDate)) {
      toast({
        title: "Invalid Dates",
        description: "Next revision date must be at least 3 months after the last revision date.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      if (formData.documentCode && !formData.documentCode.startsWith('SDG')) {
        toast({
          title: "Invalid Document Code",
          description: "Document code must start with 'SDG'.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      const updatedDocument = {
        ...formData,
        // Ensure dates are in the correct format
        lastRevisionDate: lastRevDate ? lastRevDate.toISOString().split('T')[0] : '',
        nextRevisionDate: nextRevDate ? nextRevDate.toISOString().split('T')[0] : ''
      };

      // We won't call logDocumentAction directly since it's now handled in the handler

      onSave(updatedDocument);
      toast({
        title: "Document Updated",
        description: `${updatedDocument.sopName} has been updated successfully.`,
        variant: "success"
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sopName">SOP Name</Label>
              <Input id="sopName" name="sopName" value={formData.sopName} onChange={handleInputChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentCode">Document Code</Label>
              <Input id="documentCode" name="documentCode" value={formData.documentCode} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={formData.documentType || ''} onValueChange={value => handleSelectChange('documentType', value)}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="versionNumber">Version Number</Label>
              <Input id="versionNumber" name="versionNumber" value={formData.versionNumber} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <CountrySelector value={formData.country} onChange={handleCountryChange} />
            </div>
            
            <div className="space-y-2">
              <DepartmentSelector value={formData.department} onChange={handleDepartmentChange} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastRevisionDate">Last Revision Date</Label>
              <Input type="date" id="lastRevisionDate" value={formatDateForInput(lastRevDate)} onChange={handleLastRevDateChange} className="h-9" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nextRevisionDate">Next Revision Date</Label>
              <Input type="date" id="nextRevisionDate" value={formatDateForInput(nextRevDate)} onChange={handleNextRevDateChange} className="h-9" />
              {nextDateError && <p className="text-sm text-red-500 mt-1">{nextDateError}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Document Owners</Label>
            <PeopleField people={formData.documentOwners || []} onChange={people => handlePeopleChange(people, 'documentOwners')} placeholder="Add document owners" />
          </div>
          
          <div className="space-y-2">
            <Label>Document Creators</Label>
            <PeopleField people={formData.documentCreators || []} onChange={people => handlePeopleChange(people, 'documentCreators')} placeholder="Add document creators" />
          </div>
          
          <div className="space-y-2">
            <Label>Reviewers</Label>
            <PeopleField people={formData.reviewers || []} onChange={people => handlePeopleChange(people, 'reviewers')} placeholder="Add reviewers" />
          </div>
          
          <div className="space-y-2">
            <Label>Compliance Contact</Label>
            <PeopleField people={formData.complianceNames || []} onChange={people => handlePeopleChange(people, 'complianceNames')} placeholder="Add compliance contacts" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !!nextDateError} className="ml-2 bg-[#ffa530]">
              {isLoading ? <>Saving...</> : <>Save Changes</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
};
export default EditDocumentForm;