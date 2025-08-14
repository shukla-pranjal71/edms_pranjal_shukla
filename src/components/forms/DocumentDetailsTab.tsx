import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import PeopleField, { Person } from "../PeopleField";
import CountrySelector from "../CountrySelector";
import DepartmentSelector from "../DepartmentSelector";
import DocumentNameSelector from "../DocumentNameSelector";
import ComplianceContactSelector from "../ComplianceContactSelector";
import { DocumentRequest } from "../DocumentRequestForm";

interface DocumentDetailsTabProps {
  documentRequest: DocumentRequest;
  lastRevDate: Date | undefined;
  nextRevDate: Date | undefined;
  nextDateError?: string;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: (name: string, value: string) => void;
  onDocumentNameChange: (value: string) => void;
  onCountryChange: (country: string) => void;
  onDepartmentChange: (department: string) => void;
  onRevDateSelect: (date: Date | undefined, type: "last" | "next") => void;
  onPeopleChange: (
    people: Person[],
    field:
      | "documentOwners"
      | "reviewers"
      | "complianceNames"
      | "documentCreators"
  ) => void;
  onNextTab: () => void;
}

const DocumentDetailsTab: React.FC<DocumentDetailsTabProps> = ({
  documentRequest,
  lastRevDate,
  nextRevDate,
  nextDateError,
  onInputChange,
  onSelectChange,
  onDocumentNameChange,
  onCountryChange,
  onDepartmentChange,
  onRevDateSelect,
  onPeopleChange,
  onNextTab,
}) => {
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

  const handleLastRevDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onRevDateSelect(date, "last");
  };

  const handleNextRevDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;

    // Validate that next revision date is at least 3 months after last revision date
    if (date && lastRevDate && !validateNextRevisionDate(lastRevDate, date)) {
      // The validation error will be handled by the parent component
      return;
    }

    onRevDateSelect(date, "next");
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMinNextRevisionDate = () => {
    if (!lastRevDate) return "";
    const minDate = calculateNextRevisionDate(lastRevDate);
    return formatDateForInput(minDate);
  };

  const handleComplianceContactsChange = (contacts: any[]) => {
    // Convert to Person format for compatibility
    const people: Person[] = contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
    }));
    onPeopleChange(people, "complianceNames");
  };

  return (
    <div className="space-y-3">
      {/* Date Validation Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Date Validation Rule:</strong> The next revision date must be
          at least 3 months after the last revision date to ensure proper review
          cycles.
        </AlertDescription>
      </Alert>

      <form className="grid grid-cols-2 gap-3">
        {/* Document Type */}
        <div className="space-y-1">
          <Label htmlFor="documentType" className="text-sm">
            Document Type
          </Label>
          <Select
            value={documentRequest.documentType}
            onValueChange={(value) => onSelectChange("documentType", value)}
          >
            <SelectTrigger id="documentType" className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOP">SOP</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
              <SelectItem value="Work Instruction">Work Instruction</SelectItem>
              <SelectItem value="Form">Form</SelectItem>
              <SelectItem value="Template">Template</SelectItem>
              <SelectItem value="Guideline">Guideline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label htmlFor="country" className="text-sm">
            Country
          </Label>
          <CountrySelector
            value={documentRequest.country}
            onChange={onCountryChange}
          />
        </div>

        {/* Department */}
        <div className="space-y-1">
          <DepartmentSelector
            value={documentRequest.department || "all"}
            onChange={onDepartmentChange}
          />
        </div>

        {/* Document Language */}
        <div className="space-y-1">
          <Label htmlFor="documentLanguage" className="text-sm">
            Document Language
          </Label>
          <Select
            value={documentRequest.documentLanguage || ""}
            onValueChange={(value) => onSelectChange("documentLanguage", value)}
          >
            <SelectTrigger id="documentLanguage" className="h-9">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Document Name */}
        <div className="space-y-1">
          <DocumentNameSelector
            value={documentRequest.sopName}
            onChange={onDocumentNameChange}
            placeholder="Enter document name"
            className=""
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="documentCode" className="text-sm">
            Document Code
          </Label>
          <Input
            id="documentCode"
            name="documentCode"
            value={documentRequest.documentCode}
            onChange={onInputChange}
            placeholder="Auto-generated"
            className="h-9"
            readOnly
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="versionNumber" className="text-sm">
            Version Number
          </Label>
          <Input
            id="versionNumber"
            name="versionNumber"
            type="text"
            value={documentRequest.versionNumber}
            onChange={onInputChange}
            placeholder="Auto-generated"
            className="h-9"
          />
        </div>

        {/* Last Revision Date */}
        <div className="space-y-1">
          <Label htmlFor="lastRevisionDate" className="text-sm">
            Last Revision Date *
          </Label>
          <Input
            type="date"
            id="lastRevisionDate"
            value={formatDateForInput(lastRevDate)}
            onChange={handleLastRevDateChange}
            className="h-9"
            required
          />
          {lastRevDate && (
            <p className="text-xs text-gray-500">
              Last revised: {formatDateForDisplay(lastRevDate)}
            </p>
          )}
        </div>

        {/* Next Revision Date */}
        <div className="space-y-1">
          <Label htmlFor="nextRevisionDate" className="text-sm">
            Next Revision Date *
          </Label>
          <Input
            type="date"
            id="nextRevisionDate"
            value={formatDateForInput(nextRevDate)}
            onChange={handleNextRevDateChange}
            min={getMinNextRevisionDate()}
            className="h-9"
            required
          />
          {lastRevDate && nextRevDate && (
            <div className="space-y-1">
              {validateNextRevisionDate(lastRevDate, nextRevDate) ? (
                <p className="text-xs text-green-600">
                  ✓ Valid: {formatDateForDisplay(nextRevDate)} is{" "}
                  {Math.ceil(
                    (nextRevDate.getTime() - lastRevDate.getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )}{" "}
                  months after last revision
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  ✗ Invalid: Must be at least 3 months after last revision
                </p>
              )}
            </div>
          )}
          {nextDateError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-xs">
                {nextDateError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="documentOwners" className="text-sm">
            Document Owners
          </Label>
          <PeopleField
            people={documentRequest.documentOwners}
            onChange={(people) => onPeopleChange(people, "documentOwners")}
            placeholder="Add document owners"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="reviewers" className="text-sm">
            Reviewers
          </Label>
          <PeopleField
            people={documentRequest.reviewers}
            onChange={(people) => onPeopleChange(people, "reviewers")}
            placeholder="Add reviewers"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <ComplianceContactSelector
            value={documentRequest.complianceNames.map((c) => c.id)}
            onChange={handleComplianceContactsChange}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="documentCreators" className="text-sm">
            Document Creators
          </Label>
          <PeopleField
            people={documentRequest.documentCreators}
            onChange={(people) => onPeopleChange(people, "documentCreators")}
            placeholder="Add document creators"
            showUserDropdown={true}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label htmlFor="description" className="text-sm">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={documentRequest.description}
            onChange={onInputChange}
            placeholder="Enter description"
            rows={3}
            className="resize-none"
          />
        </div>
      </form>

      <div className="flex justify-end mt-3"></div>
    </div>
  );
};

export default DocumentDetailsTab;
