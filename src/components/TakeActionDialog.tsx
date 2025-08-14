import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { DocumentRequest } from './DocumentRequestForm';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from './table/DocumentTableTypes';

interface TakeActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentRequest | null;
  onSubmit: (updatedDocument: DocumentRequest, metadata: any) => void;
}

export const TakeActionDialog: React.FC<TakeActionDialogProps> = ({
  open,
  onOpenChange,
  document,
  onSubmit
}) => {
  const { toast } = useToast();
  
  // Form fields - exactly matching the original DocumentRequestForm
  const [sopName, setSopName] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('SOP');
  const [description, setDescription] = useState('');
  const [documentCode, setDocumentCode] = useState('');
  
  // Additional fields that might be in the original form
  const [documentOwners, setDocumentOwners] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [documentCreators, setDocumentCreators] = useState<any[]>([]);
  const [complianceNames, setComplianceNames] = useState<any[]>([]);
  
  // Metadata fields for controller action
  const [documentCategory, setDocumentCategory] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill ALL form fields when document changes - exactly as they were submitted
  useEffect(() => {
    if (document && open) {
      // Basic document details
      setSopName(document.sopName || '');
      setDepartment(document.department || '');
      setCountry(document.country || '');
      setDocumentType((document.documentType as DocumentType) || 'SOP');
      setDescription(document.description || '');
      setDocumentCode(document.documentCode || '');
      
      // People assignments - preserve exactly as originally submitted
      setDocumentOwners(document.documentOwners || []);
      setReviewers(document.reviewers || []);
      setDocumentCreators(document.documentCreators || []);
      setComplianceNames(document.complianceNames || []);
      
      // For queried documents, pre-fill notes with query context
      if (document.status === 'queried') {
        const lastComment = document.comments?.slice(-1)[0];
        if (lastComment && lastComment.includes('Query:')) {
          setNotes(`Addressing query: ${lastComment}`);
        }
      }
    }
  }, [document, open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
    }
  };

  const handleEffectiveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEffectiveDate(e.target.value);
  };

  const handleSubmit = async () => {
    if (!document) return;

    if (!documentCategory || !validityPeriod || !effectiveDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required metadata fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        documentCategory,
        validityPeriod,
        effectiveDate,
        attachment,
        notes
      };

      // Determine routing based on document status
      let newStatus: DocumentRequest['status'] = 'under-review';
      let pendingWith = 'Document Requester';
      
      // If document was queried, route back to the user who raised the query
      if (document.status === 'queried') {
        const queryComment = document.comments?.find(comment => comment.includes('Query from'));
        if (queryComment?.includes('Document Creator')) {
          pendingWith = 'Document Creator';
        } else if (queryComment?.includes('Document Requester')) {
          pendingWith = 'Document Requester';
        } else if (queryComment?.includes('Document Reviewer')) {
          pendingWith = 'Document Reviewer';
        }
      }

      const updatedDocument: DocumentRequest = {
        ...document,
        // Update ALL editable fields exactly as in the original form
        sopName,
        department,
        country,
        documentType,
        description,
        documentCode,
        documentOwners,
        reviewers,
        documentCreators,
        complianceNames,
        // Update workflow
        status: newStatus,
        pendingWith,
        effectiveDate,
        comments: [
          ...(document.comments || []), 
          `Controller Action: Document updated and resubmitted. ${notes || 'No additional notes'}`
        ]
      };

      onSubmit(updatedDocument, metadata);
      
      // Reset form
      resetForm();
      
      toast({
        title: document.status === 'queried' ? "Query Addressed" : "Document Processed",
        description: `Document has been updated and sent to ${pendingWith} for review.`,
        variant: "default"
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error taking action:', error);
      toast({
        title: "Error",
        description: "Failed to process the document action.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSopName('');
    setDepartment('');
    setCountry('');
    setDocumentType('SOP');
    setDescription('');
    setDocumentCode('');
    setDocumentOwners([]);
    setReviewers([]);
    setDocumentCreators([]);
    setComplianceNames([]);
    setDocumentCategory('');
    setValidityPeriod('');
    setEffectiveDate('');
    setAttachment(null);
    setNotes('');
  };

  if (!document) return null;

  const isQueriedDocument = document.status === 'queried';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isQueriedDocument ? 'Address Query & Resubmit' : 'Take Action'} - {document.sopName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Show query information if document was queried */}
          {isQueriedDocument && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Query Details</h3>
              <div className="text-sm text-red-700">
                {document.comments?.filter(comment => comment.includes('Query')).map((comment, index) => (
                  <p key={index} className="mb-1">{comment}</p>
                ))}
              </div>
            </div>
          )}

          {/* Original Form Fields - Exactly as submitted */}
          <div className="space-y-4">
            <h3 className="font-semibold">Document Request Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sopName">Document Name *</Label>
                <Input
                  id="sopName"
                  value={sopName}
                  onChange={(e) => setSopName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentCode">Document Code *</Label>
                <Input
                  id="documentCode"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  placeholder="Enter document code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="Quality">Quality Assurance</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOP">Standard Operating Procedure</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Guideline">Guideline</SelectItem>
                  <SelectItem value="Work Instruction">Work Instruction</SelectItem>
                  <SelectItem value="Form">Form</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
                rows={3}
              />
            </div>

            {/* Show assigned people (read-only for context) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Owners (Original Assignment)</Label>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {documentOwners.length > 0 
                    ? documentOwners.map(owner => owner.name).join(', ')
                    : 'None assigned'
                  }
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Reviewers (Original Assignment)</Label>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {reviewers.length > 0 
                    ? reviewers.map(reviewer => reviewer.name).join(', ')
                    : 'None assigned'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Document Controller Metadata */}
          <div className="space-y-4">
            <h3 className="font-semibold">Controller Action Required</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentCategory">Document Category *</Label>
                <Select value={documentCategory} onValueChange={setDocumentCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityPeriod">Validity Period *</Label>
                <Select value={validityPeriod} onValueChange={setValidityPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select validity period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="2-years">2 Years</SelectItem>
                    <SelectItem value="3-years">3 Years</SelectItem>
                    <SelectItem value="5-years">5 Years</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                type="date"
                id="effectiveDate"
                value={effectiveDate}
                onChange={handleEffectiveDateChange}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attach Updated Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  id="attachment"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const fileInput = window.document.getElementById('attachment') as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {attachment ? attachment.name : "No file chosen"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Controller Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isQueriedDocument ? "Explain how you addressed the query..." : "Add notes about changes made..."}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className={isQueriedDocument ? "bg-red-500 hover:bg-red-600" : "bg-[#ffa530] hover:bg-orange-600"}
            >
              {isSubmitting ? "Processing..." : (isQueriedDocument ? "Address Query & Submit" : "Submit for Review")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
