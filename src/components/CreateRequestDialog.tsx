import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Edit3, Upload, X } from 'lucide-react';
import { BaseDocumentRequest } from './table/DocumentTableTypes';
import { MultiSelectChips } from './MultiSelectChips';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: BaseDocumentRequest[];
}

const CreateRequestDialog: React.FC<CreateRequestDialogProps> = ({
  open,
  onOpenChange,
  documents
}) => {
  const [activeTab, setActiveTab] = useState("new-request");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [documentOwners, setDocumentOwners] = useState('');
  const [pointOfContact, setPointOfContact] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<BaseDocumentRequest[]>([]);

  // Available countries and departments (hardcoded for now)
  const countries = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];
  const departments = ['HR', 'Finance', 'IT', 'Operations', 'Marketing', 'Legal'];

  // Filter documents based on selected countries and departments
  useEffect(() => {
    if (selectedCountries.length === 0 && selectedDepartments.length === 0) {
      setFilteredDocuments([]);
      return;
    }

    const filtered = documents.filter(doc => {
      const countryMatch = selectedCountries.length === 0 || 
        selectedCountries.includes('all') || 
        selectedCountries.includes(doc.country);
      const departmentMatch = selectedDepartments.length === 0 || 
        selectedDepartments.includes('all') || 
        selectedDepartments.includes(doc.department);
      return countryMatch && departmentMatch;
    });

    setFilteredDocuments(filtered);
  }, [selectedCountries, selectedDepartments, documents]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const formData = {
      activeTab,
      selectedCountries,
      selectedDepartments,
      documentOwners,
      pointOfContact,
      description,
      attachments,
      documentName: activeTab === 'new-request' ? documentName : selectedDocumentName
    };
    
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedCountries([]);
    setSelectedDepartments([]);
    setDocumentOwners('');
    setPointOfContact('');
    setDescription('');
    setAttachments([]);
    setDocumentName('');
    setSelectedDocumentName('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Request</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-request" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Document Request
            </TabsTrigger>
            <TabsTrigger value="change-request" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Change Request
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[70vh] space-y-6 p-1">
            {/* Shared Form Elements */}
            <div className="space-y-4">
              {/* Countries Multi-Select */}
              <MultiSelectChips
                options={countries}
                value={selectedCountries}
                onChange={setSelectedCountries}
                placeholder="Select countries"
                label="Countries"
                includeAllOption={true}
              />

              {/* Departments Multi-Select */}
              <MultiSelectChips
                options={departments}
                value={selectedDepartments}
                onChange={setSelectedDepartments}
                placeholder="Select departments"
                label="Departments"
                includeAllOption={true}
              />

              {/* Tab-specific Document Name Field */}
              <TabsContent value="new-request" className="mt-4">
                <div>
                  <Label htmlFor="document-name" className="text-sm font-medium mb-2 block">
                    Document Name
                  </Label>
                  <Input
                    id="document-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
              </TabsContent>

              <TabsContent value="change-request" className="mt-4">
                <div>
                  <Label htmlFor="document-dropdown" className="text-sm font-medium mb-2 block">
                    Document Name
                  </Label>
                  <Select value={selectedDocumentName} onValueChange={setSelectedDocumentName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.sopName}>
                          {doc.sopName} ({doc.documentCode})
                        </SelectItem>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <SelectItem value="" disabled>
                          No documents found for selected filters
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Document Owners */}
              <div>
                <Label htmlFor="document-owners" className="text-sm font-medium mb-2 block">
                  Document Owners
                </Label>
                <Input
                  id="document-owners"
                  value={documentOwners}
                  onChange={(e) => setDocumentOwners(e.target.value)}
                  placeholder="Enter email addresses (comma separated)"
                />
              </div>

              {/* Point of Contact */}
              <div>
                <Label htmlFor="poc" className="text-sm font-medium mb-2 block">
                  Point of Contact (POC)
                </Label>
                <Input
                  id="poc"
                  value={pointOfContact}
                  onChange={(e) => setPointOfContact(e.target.value)}
                  placeholder="Enter email addresses (comma separated)"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              {/* Attachments */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Attachments</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Files
                    </Label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600">
                Submit Request
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
