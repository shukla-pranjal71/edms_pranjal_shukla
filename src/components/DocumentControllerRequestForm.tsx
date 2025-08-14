import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
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
import { Checkbox } from "@/components/ui/checkbox";
import { BaseDocumentRequest } from "./table/DocumentTableTypes";
import { countryService } from "@/services/countryService";
import { departmentService } from "@/services/departmentService";
import { documentTypeService } from "@/services/documentTypeService";
import PeopleField, { Person } from "./PeopleField";
import DocumentNameSelector from "./DocumentNameSelector";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { UploadButton } from "./uploadButton";
import { FileService } from "@/services/fileService";
import { MultiSelectChips } from "./MultiSelectChips";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export interface DocumentControllerRequest {
  id: string;
  documentId: string;
  documentName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  requestorId: string;
  requestorName: string;
  documentCode?: string;
  documentType?: string;
  department?: string;
  versionNumber?: string;
  country?: string;
  lastRevisionDate?: string;
  nextRevisionDate?: string;
  taskOwners?: Person[];
  reviewers?: Person[];
  complianceContacts?: Person[];
  documentOwners?: Person[];
  attachmentUrl?: string;
  attachmentName?: string;
  documentLanguage?: string;
}
interface DocumentControllerRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Partial<DocumentControllerRequest>) => void;
  documents: BaseDocumentRequest[];
  isUploadMode?: boolean;
}
const DocumentControllerRequestForm: React.FC<
  DocumentControllerRequestFormProps
> = ({ open, onOpenChange, onSubmit, documents, isUploadMode = false }) => {
  // Form state
  const [documentType, setDocumentType] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [documentCode, setDocumentCode] = useState("");
  const [versionNumber, setVersionNumber] = useState("");
  const [description, setDescription] = useState("");
  const [lastRevisionDate, setLastRevisionDate] = useState("");
  const [nextRevisionDate, setNextRevisionDate] = useState("");
  const [taskOwners, setTaskOwners] = useState<Person[]>([]);
  const [reviewers, setReviewers] = useState<Person[]>([]);
  const [complianceContacts, setComplianceContacts] = useState<Person[]>([]);
  const [documentOwners, setDocumentOwners] = useState<Person[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentLanguage, setDocumentLanguage] = useState("");
  const [uploadedToSharePoint, setUploadedToSharePoint] = useState(false);

  // Data state
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  // Load data from services
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesResponse, departmentsResponse, documentTypesData] =
          await Promise.all([
            countryService.getAllCountries(),
            departmentService.getAllDepartments(),
            documentTypeService.getAllDocumentTypes(),
          ]);
        setCountriesData(countriesResponse);
        setDepartmentsData(departmentsResponse);
        setDocumentTypes(documentTypesData);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };
    if (open || isUploadMode) {
      loadData();
    }
  }, [open, isUploadMode]);

  // Auto-generate document code when department, document type, and document name change
  useEffect(() => {
    if (departments.length > 0 && documentType && documentName) {
      generateDocumentCode();
    }
  }, [departments, documentType, documentName]);

  // Auto-generate version number when document code changes
  useEffect(() => {
    if (documentCode) {
      generateVersionNumber();
    }
  }, [documentCode]);
  const generateDocumentCode = () => {
    if (departments.length === 0 || !documentType) return;
    const deptAbbr = departments[0].substring(0, 3).toUpperCase();
    let typeAbbr = "";
    switch (documentType.toLowerCase()) {
      case "sop":
        typeAbbr = "SOP";
        break;
      case "policy":
        typeAbbr = "POL";
        break;
      case "work instruction":
        typeAbbr = "WI";
        break;
      case "form":
        typeAbbr = "FORM";
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
    const matchingDocs = documents.filter(
      (doc) => doc.documentCode === documentCode
    );
    if (matchingDocs.length === 0) {
      setVersionNumber("1.0");
      return;
    }

    // Find the highest version number
    let highestVersion = 0;
    matchingDocs.forEach((doc) => {
      const version = parseFloat(doc.versionNumber || "0");
      if (!isNaN(version) && version > highestVersion) {
        highestVersion = version;
      }
    });

    // Increment version by 0.1
    const newVersion = (highestVersion + 0.1).toFixed(1);
    setVersionNumber(newVersion);
  };
  const handleFileSelected = async (file: File) => {
    setAttachment(file);
    console.log(`${file.name} has been selected for upload.`);
  };
  const handleSharePointUpload = () => {
    // Simulate SharePoint upload
    console.log("Uploading to SharePoint...");
    setUploadedToSharePoint(true);
    // In a real implementation, this would handle the SharePoint upload
  };
  const handleSubmit = async () => {
    if (
      !documentType ||
      departments.length === 0 ||
      countries.length === 0 ||
      !documentName ||
      !description
    ) {
      console.error("Missing required fields");
      return;
    }
    if (documentCode && !documentCode.startsWith("SDG")) {
      console.error("Invalid Document Code - must start with 'SDG'");
      return;
    }
    setIsUploading(true);
    let attachmentUrl = "";
    let attachmentName = "";
    try {
      // Upload file if attachment is provided
      if (attachment) {
        try {
          const documentId = uuidv4();
          const fileName = `${documentId}-${attachment.name.replace(
            /\s+/g,
            "_"
          )}`;
          attachmentUrl = await FileService.uploadFile(attachment, fileName);
          attachmentName = attachment.name;
          console.log("Document attachment uploaded successfully");
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setIsUploading(false);
          return;
        }
      }
      const requestData = {
        documentId: uuidv4(),
        documentName,
        documentType,
        department: departments.join(", "),
        country: countries.join(", "),
        documentCode,
        versionNumber,
        description,
        lastRevisionDate,
        nextRevisionDate,
        taskOwners,
        reviewers,
        complianceContacts,
        documentOwners,
        attachmentUrl,
        attachmentName,
        documentLanguage,
        // Set status to 'live' for upload mode, otherwise use default workflow
        status: isUploadMode ? "live" : "under-review",
      };
      onSubmit(requestData);
      if (!isUploadMode) {
        onOpenChange(false);
      }
      clearForm();
    } finally {
      setIsUploading(false);
    }
  };
  const clearForm = () => {
    setDocumentType("");
    setDepartments([]);
    setCountries([]);
    setDocumentName("");
    setDocumentCode("");
    setVersionNumber("");
    setDescription("");
    setLastRevisionDate("");
    setNextRevisionDate("");
    setTaskOwners([]);
    setReviewers([]);
    setComplianceContacts([]);
    setDocumentOwners([]);
    setAttachment(null);
    setDocumentLanguage("");
    setUploadedToSharePoint(false);
  };

  // Convert data to searchable select options
  const documentTypeOptions: SearchableSelectOption[] = documentTypes.map(
    (type) => ({
      value: type.name,
      label: type.name,
    })
  );
  const languageOptions: SearchableSelectOption[] = [
    {
      value: "English",
      label: "English",
    },
    {
      value: "Arabic",
      label: "Arabic",
    },
  ];

  // Convert data to multi-select options
  const countryOptions = countriesData.map((country) => country.name);
  const departmentOptions = departmentsData.map((dept) => dept.name);
  const formContent = (
    <div className="grid gap-3 py-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Validation Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Date Validation Rule:</strong> The next revision date must
            be at least 3 months after the last revision date to ensure proper
            review cycles.
          </AlertDescription>
        </Alert>

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
            <Label htmlFor="documentLanguage">Document Language</Label>
            <SearchableSelect
              options={languageOptions}
              value={documentLanguage}
              onValueChange={setDocumentLanguage}
              placeholder="Select language"
              searchPlaceholder="Search languages..."
              emptyMessage="No languages found."
              className="h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="countries">Countries *</Label>
            <MultiSelectChips
              options={countryOptions}
              value={countries}
              onChange={setCountries}
              placeholder="Select countries"
              label=""
              includeAllOption={false}
            />
          </div>
          <div>
            <Label htmlFor="departments">Departments *</Label>
            <MultiSelectChips
              options={departmentOptions}
              value={departments}
              onChange={setDepartments}
              placeholder="Select departments"
              label=""
              includeAllOption={false}
            />
          </div>
        </div>

        <div>
          <DocumentNameSelector
            value={documentName}
            onChange={setDocumentName}
            department={departments.length > 0 ? departments[0] : ""}
            documentType={documentType}
            placeholder="Select document name"
            showCustomEntry={true}
          />
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
            placeholder="Detailed description of the request"
            className="resize-none min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="lastRevisionDate" className="text-sm">
              Last Revision Date *
            </Label>
            <Input
              type="date"
              id="lastRevisionDate"
              value={lastRevisionDate}
              onChange={(e) => {
                const date = e.target.value;
                setLastRevisionDate(date);
                // Auto-calculate next revision date to 3 months later
                if (date) {
                  const lastDate = new Date(date);
                  const nextDate = new Date(lastDate);
                  nextDate.setMonth(nextDate.getMonth() + 3);
                  setNextRevisionDate(nextDate.toISOString().split("T")[0]);
                }
              }}
              className="h-9"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nextRevisionDate" className="text-sm">
              Next Revision Date *
            </Label>
            <Input
              type="date"
              id="nextRevisionDate"
              value={nextRevisionDate}
              onChange={(e) => setNextRevisionDate(e.target.value)}
              min={
                lastRevisionDate
                  ? (() => {
                      const lastDate = new Date(lastRevisionDate);
                      const minDate = new Date(lastDate);
                      minDate.setMonth(minDate.getMonth() + 3);
                      return minDate.toISOString().split("T")[0];
                    })()
                  : ""
              }
              className="h-9"
              required
            />
            {lastRevisionDate && nextRevisionDate && (
              <div className="space-y-1">
                {(() => {
                  const lastDate = new Date(lastRevisionDate);
                  const nextDate = new Date(nextRevisionDate);
                  const monthsDiff =
                    (nextDate.getTime() - lastDate.getTime()) /
                    (1000 * 60 * 60 * 24 * 30);
                  return monthsDiff >= 3 ? (
                    <p className="text-xs text-green-600">
                      ✓ Valid:{" "}
                      {nextDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      is {Math.ceil(monthsDiff)} months after last revision
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">
                      ✗ Invalid: Must be at least 3 months after last revision
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="documentOwners" className="text-sm">
            Document Owners
          </Label>
          <PeopleField
            people={documentOwners}
            onChange={setDocumentOwners}
            placeholder="Add document owners"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="taskOwners" className="text-sm">
            Task Owners
          </Label>
          <PeopleField
            people={taskOwners}
            onChange={setTaskOwners}
            placeholder="Add task owners"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="reviewers" className="text-sm">
            Reviewers
          </Label>
          <PeopleField
            people={reviewers}
            onChange={setReviewers}
            placeholder="Add reviewers"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="complianceContacts" className="text-sm">
            Compliance Contacts
          </Label>
          <PeopleField
            people={complianceContacts}
            onChange={setComplianceContacts}
            placeholder="Add compliance contacts"
            showUserDropdown={true}
          />
        </div>

        <div>
          <Label htmlFor="attachment">Document Attachment</Label>
          <div className="flex items-center gap-3">
            <UploadButton
              onFileSelected={handleFileSelected}
              acceptedFileTypes=".pdf,.doc,.docx,.txt"
              label="Choose File"
              disabled={isUploading}
            />
            {attachment && (
              <span className="text-sm text-muted-foreground">
                {attachment.name}
              </span>
            )}
          </div>
        </div>

        {isUploadMode && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uploadedToSharePoint"
              checked={uploadedToSharePoint}
              onCheckedChange={(checked) =>
                setUploadedToSharePoint(checked === true)
              }
            />
            <Label htmlFor="uploadedToSharePoint">Uploaded to SharePoint</Label>
          </div>
        )}
      </form>
    </div>
  );
  const getSubmitButton = () => {
    if (isUploadMode) {
      if (uploadedToSharePoint) {
        return (
          <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Submit Request"}
          </Button>
        );
      } else {
        return (
          <Button
            type="button"
            onClick={handleSharePointUpload}
            disabled={isUploading}
            className="bg-[t#FFA530] bg-[#ffa530]"
          >
            Upload to SharePoint
          </Button>
        );
      }
    } else {
      return (
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isUploading}
          className="bg-[t#ffa530] bg-[#ffa530]"
        >
          {isUploading ? "Uploading..." : "Submit Request"}
        </Button>
      );
    }
  };
  if (isUploadMode) {
    return (
      <div className="space-y-4">
        {formContent}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={clearForm}>
            Clear Form
          </Button>
          {getSubmitButton()}
        </div>
      </div>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
          <DialogDescription>Create a new document request.</DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          {getSubmitButton()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DocumentControllerRequestForm;
