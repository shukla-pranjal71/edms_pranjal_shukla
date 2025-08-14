import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileInput } from "@/components/FileInput";
import { DocumentTable } from "@/components/table";
import PeopleField, { Person } from "@/components/PeopleField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Plus,
  FileText,
  CalendarIcon,
  Search,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BaseDocumentRequest } from "@/components/table/DocumentTableTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
interface DocumentFormData {
  documentCode: string;
  title: string;
  type: string;
  description: string;
  department: string;
  country: string;
  version: string;
  lastRevisionDate: Date | undefined;
  nextRevisionDate: Date | undefined;
  file: File | null;
  taskOwners: Person[];
  reviewers: Person[];
  documentOwners: Person[];
}
interface DocumentUploadTabProps {
  uploadedDocuments?: BaseDocumentRequest[];
  onDocumentUploaded?: (document: BaseDocumentRequest) => void;
  onViewDocument?: (document: BaseDocumentRequest) => void;
  onDownload?: (document: BaseDocumentRequest) => void;
  onDeleteDocument?: (document: BaseDocumentRequest) => void;
  onArchiveDocument?: (document: BaseDocumentRequest) => void;
  onPushNotification?: (document: BaseDocumentRequest) => void;
}

// Dummy data for uploaded documents
const dummyUploadedDocuments: BaseDocumentRequest[] = [
  {
    id: "upload-001",
    documentCode: "SOP-HR-2024001",
    sopName: "Employee Onboarding Process",
    versionNumber: "2.1",
    uploadDate: "2024-01-15T10:30:00Z",
    department: "HR",
    status: "live",
    documentOwners: [],
    reviewers: [],
    documentCreators: [],
    complianceNames: [],
    country: "UAE",
    isBreached: false,
    documentType: "SOP",
    description: "Comprehensive guide for new employee onboarding",
    lastRevisionDate: "2024-01-10T00:00:00Z",
    nextRevisionDate: "2024-07-10T00:00:00Z",
    fileUrl: "sharepoint://documents/employee-onboarding.pdf",
  },
  {
    id: "upload-002",
    documentCode: "POL-IT-2024002",
    sopName: "IT Security Policy",
    versionNumber: "1.5",
    uploadDate: "2024-01-20T14:15:00Z",
    department: "IT",
    status: "live",
    documentOwners: [],
    reviewers: [],
    documentCreators: [],
    complianceNames: [],
    country: "KSA",
    isBreached: false,
    documentType: "Policy",
    description: "Security protocols and guidelines for IT infrastructure",
    lastRevisionDate: "2024-01-18T00:00:00Z",
    nextRevisionDate: "2024-07-18T00:00:00Z",
    fileUrl: "sharepoint://documents/it-security-policy.pdf",
  },
  {
    id: "upload-003",
    documentCode: "PROC-FIN-2024003",
    sopName: "Invoice Processing Procedure",
    versionNumber: "3.0",
    uploadDate: "2024-01-25T09:45:00Z",
    department: "Finance",
    status: "live",
    documentOwners: [],
    reviewers: [],
    documentCreators: [],
    complianceNames: [],
    country: "UAE",
    isBreached: false,
    documentType: "Procedure",
    description: "Step-by-step process for handling vendor invoices",
    lastRevisionDate: "2024-01-22T00:00:00Z",
    nextRevisionDate: "2024-07-22T00:00:00Z",
    fileUrl: "sharepoint://documents/invoice-processing.pdf",
  },
];
const DocumentUploadTab: React.FC<DocumentUploadTabProps> = ({
  uploadedDocuments = dummyUploadedDocuments,
  onDocumentUploaded,
  onViewDocument,
  onDownload,
  onDeleteDocument,
  onArchiveDocument,
  onPushNotification,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] =
    useState<BaseDocumentRequest[]>(uploadedDocuments);
  const [formData, setFormData] = useState<DocumentFormData>({
    documentCode: "",
    title: "",
    type: "",
    description: "",
    department: "",
    country: "",
    version: "1.0",
    lastRevisionDate: undefined,
    nextRevisionDate: undefined,
    file: null,
    taskOwners: [],
    reviewers: [],
    documentOwners: [],
  });
  const documentTypes = [
    "SOP",
    "Policy",
    "Procedure",
    "Work Instruction",
    "Form",
    "Template",
  ];
  const departments = [
    "Finance",
    "HR",
    "IT",
    "Legal",
    "Marketing",
    "Operations",
    "R&D",
    "Sales",
    "Supply Chain",
  ];
  const countries = ["UAE", "KSA", "OMN", "BHR", "EGY"];
  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleDateChange = (
    field: "lastRevisionDate" | "nextRevisionDate",
    date: Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };
  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };
  const handlePeopleChange = (
    people: Person[],
    field: "taskOwners" | "reviewers" | "documentOwners"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: people,
    }));
  };
  const validateDocumentCode = (code: string): boolean => {
    // Check if code is not empty
    if (!code.trim()) {
      console.log("Validation Error: Document code is required");
      return false;
    }

    // Check for proper format (letters, numbers, hyphens)
    const formatRegex = /^[A-Z0-9-]+$/;
    if (!formatRegex.test(code)) {
      console.log(
        "Validation Error: Document code must contain only uppercase letters, numbers, and hyphens"
      );
      return false;
    }

    // Check for uniqueness against existing documents
    const isUnique = !documents.some((doc) => doc.documentCode === code);
    if (!isUnique) {
      console.log("Validation Error: Document code must be unique");
      return false;
    }
    return true;
  };
  const validateForm = () => {
    const requiredFields = [
      "documentCode",
      "title",
      "type",
      "department",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof DocumentFormData]
    );
    if (missingFields.length > 0) {
      console.log(
        `Validation Error: Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return false;
    }

    // Validate document code
    if (!validateDocumentCode(formData.documentCode)) {
      return false;
    }
    if (!formData.file) {
      console.log("Validation Error: Please select a file to upload");
      return false;
    }
    if (!formData.lastRevisionDate) {
      console.log("Validation Error: Last revision date is required");
      return false;
    }
    if (!formData.nextRevisionDate) {
      console.log("Validation Error: Next revision date is required");
      return false;
    }

    // Validate date logic
    if (formData.lastRevisionDate && formData.nextRevisionDate) {
      if (formData.nextRevisionDate <= formData.lastRevisionDate) {
        console.log(
          "Validation Error: Next revision date must be after last revision date"
        );
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsUploading(true);
    try {
      // Simulate API call to create document and upload to SharePoint
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create new document with Live status
      const newDocument: BaseDocumentRequest = {
        id: `doc-${Date.now()}`,
        documentCode: formData.documentCode,
        sopName: formData.title,
        versionNumber: formData.version,
        uploadDate: new Date().toISOString(),
        department: formData.department,
        status: "live",
        // Set status to Live
        documentOwners: formData.documentOwners,
        reviewers: formData.reviewers,
        documentCreators: formData.taskOwners,
        // Using taskOwners as documentCreators
        complianceNames: [],
        country: formData.country,
        isBreached: false,
        documentType: formData.type as any,
        description: formData.description,
        lastRevisionDate: formData.lastRevisionDate?.toISOString(),
        nextRevisionDate: formData.nextRevisionDate?.toISOString(),
        fileUrl: `sharepoint://documents/${formData.file?.name}`,
        createdAt: new Date().toISOString(),
      };
      console.log(
        `Document Uploaded Successfully: ${formData.title} has been uploaded to SharePoint`
      );

      // Add to local documents list (add to beginning for newest first)
      setDocuments((prev) => [newDocument, ...prev]);

      // Call the parent callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded(newDocument);
      }

      // Reset form
      setFormData({
        documentCode: "",
        title: "",
        type: "",
        description: "",
        department: "",
        country: "",
        version: "1.0",
        lastRevisionDate: undefined,
        nextRevisionDate: undefined,
        file: null,
        taskOwners: [],
        reviewers: [],
        documentOwners: [],
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error(
        "Upload Failed: There was an error uploading the document. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      documentCode: "",
      title: "",
      type: "",
      description: "",
      department: "",
      country: "",
      version: "1.0",
      lastRevisionDate: undefined,
      nextRevisionDate: undefined,
      file: null,
      taskOwners: [],
      reviewers: [],
      documentOwners: [],
    });
  };

  // Default handlers for document actions
  const handleSelectDocument = (doc: BaseDocumentRequest) => {
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };
  const handleViewDocument = (doc: BaseDocumentRequest) => {
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };
  const handleDownload = (doc: BaseDocumentRequest) => {
    if (onDownload) {
      onDownload(doc);
    }
  };
  const handleDeleteDocument = (doc: BaseDocumentRequest) => {
    if (onDeleteDocument) {
      onDeleteDocument(doc);
    }
    // Remove from local list
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };
  const handleArchiveDocument = (doc: BaseDocumentRequest) => {
    if (onArchiveDocument) {
      onArchiveDocument(doc);
    }
    // Remove from local list (archived documents don't show here)
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };
  const handlePushNotification = (doc: BaseDocumentRequest) => {
    if (onPushNotification) {
      onPushNotification(doc);
    }
  };

  // Sort dropdown options alphabetically
  const sortedDocumentTypes = [
    "Form",
    "Manual",
    "Policy",
    "Procedure",
    "SOP",
    "Template",
    "Work Instruction",
  ].sort();
  const sortedDepartments = [
    "Finance",
    "HR",
    "IT",
    "Legal",
    "Marketing",
    "Operations",
    "R&D",
    "Sales",
    "Supply Chain",
  ].sort();
  const sortedCountries = ["BHR", "EGY", "KSA", "OMN", "UAE"].sort();

  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const getMinNextRevisionDate = (lastRevisionDate: Date) => {
    const threeMonthsLater = new Date(lastRevisionDate);
    threeMonthsLater.setMonth(lastRevisionDate.getMonth() + 3);
    return formatDateForInput(threeMonthsLater);
  };

  const validateNextRevisionDate = (
    lastRevisionDate: Date,
    nextRevisionDate: Date
  ) => {
    const diffInMonths =
      (nextRevisionDate.getTime() - lastRevisionDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    return diffInMonths >= 3;
  };

  const formatDateForDisplay = (date: Date) => {
    return format(date, "PPP");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
          <p className="text-sm text-gray-600">
            Upload and manage documents to SharePoint integration
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-[#117bbc] text-slate-50">
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg">Upload New Document</DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the document details and upload the file to SharePoint
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Date Validation Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Date Validation Rule:</strong> The next revision date
                  must be at least 3 months after the last revision date to
                  ensure proper review cycles.
                </AlertDescription>
              </Alert>

              {/* Basic Information Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="documentCode"
                      className="text-xs font-medium"
                    >
                      Document Code *
                    </Label>
                    <Input
                      id="documentCode"
                      value={formData.documentCode}
                      onChange={(e) =>
                        handleInputChange(
                          "documentCode",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Enter document code (e.g., SOP-HR-2024001)"
                      className="h-8 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-xs font-medium">
                      Document Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter document title"
                      className="h-8 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="type" className="text-xs font-medium">
                      Document Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center border-b px-3 pb-2 mb-2">
                          <Search className="w-4 h-4 mr-2 opacity-50" />
                          <Input
                            placeholder="Search document types..."
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0"
                          />
                        </div>
                        <ScrollArea className="h-40">
                          {sortedDocumentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="department" className="text-xs font-medium">
                      Department *
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center border-b px-3 pb-2 mb-2">
                          <Search className="w-4 h-4 mr-2 opacity-50" />
                          <Input
                            placeholder="Search departments..."
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0"
                          />
                        </div>
                        <ScrollArea className="h-48">
                          {sortedDepartments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="country" className="text-xs font-medium">
                      Country *
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center border-b px-3 pb-2 mb-2">
                          <Search className="w-4 h-4 mr-2 opacity-50" />
                          <Input
                            placeholder="Search countries..."
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0"
                          />
                        </div>
                        <ScrollArea className="h-40">
                          {sortedCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="version" className="text-xs font-medium">
                      Version
                    </Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) =>
                        handleInputChange("version", e.target.value)
                      }
                      placeholder="1.0"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* People Fields Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                  People Assignment
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="taskOwners" className="text-sm">
                      Task Owners
                    </Label>
                    <PeopleField
                      people={formData.taskOwners}
                      onChange={(people) =>
                        handlePeopleChange(people, "taskOwners")
                      }
                      placeholder="Add task owners"
                      showUserDropdown={true}
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="reviewers" className="text-sm">
                      Reviewers
                    </Label>
                    <PeopleField
                      people={formData.reviewers}
                      onChange={(people) =>
                        handlePeopleChange(people, "reviewers")
                      }
                      placeholder="Add reviewers"
                      showUserDropdown={true}
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="documentOwners" className="text-sm">
                      Document Owners
                    </Label>
                    <PeopleField
                      people={formData.documentOwners}
                      onChange={(people) =>
                        handlePeopleChange(people, "documentOwners")
                      }
                      placeholder="Add document owners"
                      showUserDropdown={true}
                    />
                  </div>
                </div>
              </div>

              {/* Date Information Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                  Date Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="lastRevisionDate" className="text-sm">
                      Last Revision Date *
                    </Label>
                    <Input
                      type="date"
                      id="lastRevisionDate"
                      value={
                        formData.lastRevisionDate
                          ? formatDateForInput(formData.lastRevisionDate)
                          : ""
                      }
                      onChange={(e) =>
                        handleDateChange(
                          "lastRevisionDate",
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                      className="h-8 text-sm"
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
                      value={
                        formData.nextRevisionDate
                          ? formatDateForInput(formData.nextRevisionDate)
                          : ""
                      }
                      onChange={(e) =>
                        handleDateChange(
                          "nextRevisionDate",
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                      min={
                        formData.lastRevisionDate
                          ? getMinNextRevisionDate(formData.lastRevisionDate)
                          : ""
                      }
                      className="h-8 text-sm"
                      required
                    />
                    {formData.lastRevisionDate && formData.nextRevisionDate && (
                      <div className="space-y-1">
                        {validateNextRevisionDate(
                          formData.lastRevisionDate,
                          formData.nextRevisionDate
                        ) ? (
                          <p className="text-xs text-green-600">
                            ✓ Valid:{" "}
                            {formatDateForDisplay(formData.nextRevisionDate)} is{" "}
                            {Math.ceil(
                              (formData.nextRevisionDate.getTime() -
                                formData.lastRevisionDate.getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                            )}{" "}
                            months after last revision
                          </p>
                        ) : (
                          <p className="text-xs text-red-600">
                            ✗ Invalid: Must be at least 3 months after last
                            revision
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                  Additional Details
                </h3>
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter document description"
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
                  File Upload
                </h3>
                <div className="space-y-1">
                  <Label htmlFor="file" className="text-xs font-medium">
                    Document File *
                  </Label>
                  <FileInput
                    onFileChange={handleFileChange}
                    acceptDocuments={true}
                    acceptImages={false}
                  />
                  {formData.file && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                      Selected:{" "}
                      <span className="font-medium">{formData.file.name}</span>{" "}
                      ({Math.round(formData.file.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  className="px-3 py-1 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Upload to SharePoint
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dynamic Uploaded Documents List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Uploaded Documents ({documents.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Documents uploaded through this tab (Status: Live) - Updates in
            real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <DocumentTable
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onViewDocument={handleViewDocument}
              onDownload={handleDownload}
              onDeleteDocument={handleDeleteDocument}
              onArchiveDocument={handleArchiveDocument}
              onPushNotification={handlePushNotification}
              userRole="admin"
              hideChangeStatus={true}
              hideNotification={false}
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-base text-gray-600 mb-2">
                No documents uploaded yet
              </p>
              <p className="text-xs text-gray-500">
                Click "Add Document" to upload your first document to SharePoint
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default DocumentUploadTab;
