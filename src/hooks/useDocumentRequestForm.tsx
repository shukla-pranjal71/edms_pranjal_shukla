import { useState, useEffect } from "react";
import { Person } from "@/components/PeopleField";
import {
  DocumentRequest,
  DocumentStatus,
} from "@/components/DocumentRequestForm";
import { FileService } from "@/services/fileService";
import { v4 as uuidv4 } from "uuid";
import {
  validateDocumentRequest,
  ensureCompleteDocumentFields,
} from "./useDocumentRequestFormValidation";

interface UseDocumentRequestFormProps {
  onAddDocument: (document: DocumentRequest) => void;
  onOpenChange: (open: boolean) => void;
  existingDocuments: DocumentRequest[];
  currentUserRole?: string;
}

export const useDocumentRequestForm = ({
  onAddDocument,
  onOpenChange,
  existingDocuments,
  currentUserRole = "document-controller",
}: UseDocumentRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRevDate, setLastRevDate] = useState<Date | undefined>();
  const [nextRevDate, setNextRevDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nextDateError, setNextDateError] = useState<string>("");

  // Determine initial status based on user role
  const getInitialStatus = (): DocumentStatus => {
    if (currentUserRole === "document-controller") {
      return "under-review";
    }
    return "under-review"; // This represents "Pending Controller Action"
  };

  const initialState: DocumentRequest = {
    id: "",
    sopName: "",
    documentCode: "",
    country: "UAE",
    lastRevisionDate: "",
    nextRevisionDate: "",
    versionNumber: "1",
    documentOwners: [],
    reviewers: [],
    complianceNames: [],
    documentCreators: [],
    comments: [],
    status: getInitialStatus(),
    department: "",
    documentType: "SOP",
    documentLanguage: "English",
  };

  const [documentRequest, setDocumentRequest] =
    useState<DocumentRequest>(initialState);

  // Auto-calculate next revision date when last revision date changes
  const calculateNextRevisionDate = (lastDate: Date): Date => {
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);
    return nextDate;
  };

  // Validate if next revision date is at least 3 months after last revision date
  const validateNextRevisionDate = (
    lastDate: Date,
    nextDate: Date
  ): boolean => {
    const minNextDate = calculateNextRevisionDate(lastDate);
    return nextDate >= minNextDate;
  };

  // Auto-generate document code when department, document type, document name, and language are available
  useEffect(() => {
    if (
      documentRequest.department &&
      documentRequest.documentType &&
      documentRequest.sopName
    ) {
      const generatedCode = generateDocumentCode(
        documentRequest.department,
        documentRequest.documentType,
        documentRequest.documentLanguage
      );

      setDocumentRequest((prev) => ({
        ...prev,
        documentCode: generatedCode,
      }));

      // After generating code, get the next version number
      fetchNextVersionNumber(generatedCode);
    }
  }, [
    documentRequest.department,
    documentRequest.documentType,
    documentRequest.sopName,
    documentRequest.documentLanguage,
  ]);

  // Auto-set default dates when not provided
  useEffect(() => {
    const currentDate = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(currentDate.getFullYear() + 1);

    if (!lastRevDate) {
      setLastRevDate(currentDate);
      setDocumentRequest((prev) => ({
        ...prev,
        lastRevisionDate: currentDate.toISOString().split("T")[0],
      }));
    }

    if (!nextRevDate) {
      const calculatedNextDate = calculateNextRevisionDate(currentDate);
      setNextRevDate(calculatedNextDate);
      setDocumentRequest((prev) => ({
        ...prev,
        nextRevisionDate: calculatedNextDate.toISOString().split("T")[0],
      }));
    }
  }, []);

  const generateDocumentCode = (
    department: string,
    documentType: string,
    language?: string
  ): string => {
    if (!department || !documentType) return "";

    // Get first 3 letters of department
    const deptPrefix = department.substring(0, 3).toUpperCase();

    // Map document type to abbreviation
    const typeAbbreviation = getDocumentTypeAbbreviation(documentType);

    // Map language to abbreviation
    const languageCode = language === "Arabic" ? "AR" : "EN";

    // Generate code with format SDG-DEPT-TYPE-01-LANG
    return `SDG-${deptPrefix}-${typeAbbreviation}-01-${languageCode}`;
  };

  const getDocumentTypeAbbreviation = (documentType: string): string => {
    const abbreviations: { [key: string]: string } = {
      SOP: "SOP",
      Policy: "POL",
      "Work Instruction": "WI",
      Form: "FORM",
      Template: "TEM",
      Guideline: "GUI",
    };

    return (
      abbreviations[documentType] || documentType.substring(0, 3).toUpperCase()
    );
  };

  const fetchNextVersionNumber = async (documentCode: string) => {
    if (!documentCode) return;

    try {
      // Find existing documents with the same code pattern (without version suffix)
      const baseCode = documentCode.substring(
        0,
        documentCode.lastIndexOf("-01-")
      );
      const existingVersions = existingDocuments
        .filter((doc) => doc.documentCode.startsWith(baseCode))
        .map((doc) => {
          // Extract version number from format SDG-DEPT-TYPE-XX-LANG
          const parts = doc.documentCode.split("-");
          if (parts.length >= 4) {
            const versionPart = parts[3]; // The version part (e.g., "01", "02")
            return parseInt(versionPart) || 0;
          }
          return 0;
        })
        .filter((v) => !isNaN(v));

      const maxVersion =
        existingVersions.length > 0 ? Math.max(...existingVersions) : 0;
      const nextVersion = maxVersion + 1;

      // Update document code with correct version
      const parts = documentCode.split("-");
      if (parts.length >= 4) {
        parts[3] = nextVersion.toString().padStart(2, "0");
        const newDocumentCode = parts.join("-");

        setDocumentRequest((prev) => ({
          ...prev,
          documentCode: newDocumentCode,
          versionNumber: nextVersion.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching next version number:", error);
      // Default to version 1 if there's an error
      setDocumentRequest((prev) => ({
        ...prev,
        versionNumber: "1",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate dates before submission
    if (
      lastRevDate &&
      nextRevDate &&
      !validateNextRevisionDate(lastRevDate, nextRevDate)
    ) {
      console.error(
        "Next revision date must be at least 3 months after the last revision date"
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const isDocumentCreator = currentUserRole === "document-creator";

      // Ensure all required fields are complete
      const completeDocument = ensureCompleteDocumentFields(documentRequest);

      // Validate the document
      const validation = validateDocumentRequest(
        completeDocument,
        attachment,
        isDocumentCreator
      );

      if (!validation.isValid) {
        console.error("Validation Error:", validation.errors.join("\n"));
        setIsSubmitting(false);
        return;
      }

      // Upload file if attachment is provided and user is not document creator
      let fileUrl: string | undefined = undefined;

      if (attachment && !isDocumentCreator) {
        setIsUploading(true);
        try {
          const documentId = uuidv4();
          const fileName = `${documentId}-${attachment.name.replace(
            /\s+/g,
            "_"
          )}`;
          const filePath = `documents/${fileName}`;

          fileUrl = await FileService.uploadFile(attachment, filePath);

          console.log("File uploaded successfully");
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Create a new document object with status based on user role
      const newDocument: DocumentRequest = {
        ...completeDocument,
        id: uuidv4(),
        status: getInitialStatus(),
        attachmentName:
          attachment && !isDocumentCreator ? attachment.name : undefined,
        fileUrl: fileUrl,
        createdAt: new Date().toISOString(),
        uploadDate: new Date().toISOString().split("T")[0],
      };

      // Pass the new document to the parent component
      onAddDocument(newDocument);

      // Reset the form
      setDocumentRequest({ ...initialState, status: getInitialStatus() });
      setLastRevDate(undefined);
      setNextRevDate(undefined);
      setAttachment(null);
      onOpenChange(false);

      console.log("Request submitted successfully");
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setDocumentRequest({
      ...documentRequest,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setDocumentRequest({
      ...documentRequest,
      [name]: value,
    });
  };

  const handleDocumentNameChange = (value: string) => {
    console.log("Document name changed to:", value);
    setDocumentRequest((prev) => ({ ...prev, sopName: value }));
  };

  const handleCountryChange = (country: string) => {
    setDocumentRequest({
      ...documentRequest,
      country: country,
    });
  };

  const handleDepartmentChange = (department: string) => {
    console.log("Department changed to:", department);
    setDocumentRequest((prev) => ({
      ...prev,
      department: department === "all" ? "" : department,
      sopName: "",
    }));
  };

  const handleRevDateSelect = (
    date: Date | undefined,
    type: "last" | "next"
  ) => {
    setNextDateError("");

    if (type === "last") {
      setLastRevDate(date);
      if (date) {
        // Auto-calculate and set next revision date to 3 months later
        const calculatedNextDate = calculateNextRevisionDate(date);
        setNextRevDate(calculatedNextDate);
        setDocumentRequest((prev) => ({
          ...prev,
          lastRevisionDate: date.toISOString().split("T")[0],
          nextRevisionDate: calculatedNextDate.toISOString().split("T")[0],
        }));
      } else {
        // Clear next revision date if last revision date is cleared
        setNextRevDate(undefined);
        setDocumentRequest((prev) => ({
          ...prev,
          lastRevisionDate: "",
          nextRevisionDate: "",
        }));
      }
    } else {
      // Validate next revision date
      if (date && lastRevDate) {
        if (!validateNextRevisionDate(lastRevDate, date)) {
          const minDate = calculateNextRevisionDate(lastRevDate);
          const monthsDiff = Math.ceil(
            (date.getTime() - lastRevDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          );
          setNextDateError(
            `Next revision date must be at least 3 months after the last revision date. ` +
              `Current selection: ${monthsDiff} months. ` +
              `Minimum allowed: ${minDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
          );
          return;
        }
      }

      setNextRevDate(date);
      const dateString = date ? date.toISOString().split("T")[0] : "";
      setDocumentRequest((prev) => ({
        ...prev,
        nextRevisionDate: dateString,
      }));
    }
  };

  const handlePeopleChange = (
    people: Person[],
    field:
      | "documentOwners"
      | "reviewers"
      | "complianceNames"
      | "documentCreators"
  ) => {
    setDocumentRequest({
      ...documentRequest,
      [field]: people,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
      setDocumentRequest({
        ...documentRequest,
        attachmentName: event.target.files[0].name,
      });
    }
  };

  return {
    documentRequest,
    lastRevDate,
    nextRevDate,
    activeTab,
    setActiveTab,
    attachment,
    isSubmitting,
    isUploading,
    nextDateError,
    handleInputChange,
    handleSelectChange,
    handleDocumentNameChange,
    handleCountryChange,
    handleDepartmentChange,
    handleRevDateSelect,
    handlePeopleChange,
    handleFileChange,
    handleSubmit,
  };
};
