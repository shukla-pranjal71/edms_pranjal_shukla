import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import TemplateList from './email-templates/TemplateList';
import TriggerSelection from './email-templates/TriggerSelection';
import FilterOptions from './email-templates/FilterOptions';
import RecipientsSelection from './email-templates/RecipientsSelection';
import EmailEditor from './email-templates/EmailEditor';

// Import types and constants
import { 
  EmailTemplate, 
  triggerOptions, 
  recipientOptions, 
  countryOptions,
  departmentOptions, 
  ccUserOptions 
} from './email-templates/types';

const initialTemplates: EmailTemplate[] = [
  {
    id: "template1",
    name: "Document Uploaded by the Document Controller",
    subject: "New SOP Document Uploaded: [Document Name]",
    body: `Dear [Recipient Name],

A new Standard Operating Procedure document has been uploaded to the SOP Management System.

Document Details:
- Document Name: [Document Name]
- Document Code: [Document Code]
- Uploaded By: [Uploader Name]
- Upload Date: [Upload Date]

Please review this document at your earliest convenience by logging into the SOP Management System.

Best regards,
SOP Management Team`,
    timerEnabled: false,
    triggerAction: "doc-upload-controller",
    recipients: ["document-owner", "reviewers"],
    cc: [],
    department: "all",
    country: "all"
  },
  // ... keep existing code (remaining template definitions)
];

const EmailTemplatesTab = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [activeTemplate, setActiveTemplate] = useState<string>(templates[0].id);
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [filteredCCUsers, setFilteredCCUsers] = useState(ccUserOptions);
  const { toast } = useToast();
  
  // Preview functionality to see how email looks with actual recipient data
  const [previewRecipientRole, setPreviewRecipientRole] = useState<string | null>(null);
  const [ccSearchTerm, setCCSearchTerm] = useState("");

  const handleEdit = () => {
    const template = templates.find(t => t.id === activeTemplate);
    if (template) {
      setEditedSubject(template.subject);
      setEditedBody(template.body);
      setEditMode(true);
    }
  };

  const handleSave = () => {
    const updatedTemplates = templates.map(template => {
      if (template.id === activeTemplate) {
        return {
          ...template,
          subject: editedSubject,
          body: editedBody
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    setEditMode(false);
    toast({
      title: "Template Updated",
      description: "The email template has been updated successfully."
    });
  };

  const toggleTimer = (templateId: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          timerEnabled: !template.timerEnabled
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    const template = updatedTemplates.find(t => t.id === templateId);
    toast({
      title: template?.timerEnabled ? "Timer Enabled" : "Timer Disabled",
      description: template?.timerEnabled ? `Email will be sent automatically on "${getTriggerLabel(template.triggerAction)}" action.` : "Email will not be sent automatically."
    });
  };

  const updateTriggerAction = (templateId: string, action: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          triggerAction: action
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    toast({
      title: "Trigger Action Updated",
      description: `Email will be sent on "${getTriggerLabel(action)}" action.`
    });
  };

  const updateDepartment = (templateId: string, department: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          department
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    
    // Update filtered CC options based on new department and country
    const template = updatedTemplates.find(t => t.id === templateId);
    filterCCOptions(department, template?.country || 'all');
    
    toast({
      title: "Department Updated",
      description: `Email will be sent to users in ${getDepartmentLabel(department)} department.`
    });
  };

  const updateCountry = (templateId: string, country: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        return {
          ...template,
          country
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    
    // Update filtered CC options based on new country and department
    const template = updatedTemplates.find(t => t.id === templateId);
    filterCCOptions(template?.department || 'all', country);
    
    toast({
      title: "Country Updated",
      description: `Email will be sent to users in ${getCountryLabel(country)}.`
    });
  };

  const toggleRecipient = (templateId: string, recipientValue: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        const currentRecipients = [...template.recipients];
        const recipientIndex = currentRecipients.indexOf(recipientValue);
        if (recipientIndex === -1) {
          // Add recipient if not already in the list
          currentRecipients.push(recipientValue);
        } else {
          // Remove recipient if already in the list
          currentRecipients.splice(recipientIndex, 1);
        }
        return {
          ...template,
          recipients: currentRecipients
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    const template = updatedTemplates.find(t => t.id === templateId);
    const recipientLabel = getRecipientLabel(recipientValue);
    const isAdded = template?.recipients.includes(recipientValue);
    toast({
      title: isAdded ? "Recipient Added" : "Recipient Removed",
      description: isAdded ? `"${recipientLabel}" will now receive this email.` : `"${recipientLabel}" will no longer receive this email.`
    });
  };

  // Handle CC list toggle
  const toggleCCUser = (templateId: string, userId: string) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === templateId) {
        const currentCCs = [...(template.cc || [])];
        const userIndex = currentCCs.indexOf(userId);
        if (userIndex === -1) {
          // Add user to CC list
          currentCCs.push(userId);
        } else {
          // Remove user from CC list
          currentCCs.splice(userIndex, 1);
        }
        return {
          ...template,
          cc: currentCCs
        };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    
    const ccUser = ccUserOptions.find(user => user.id === userId);
    const template = updatedTemplates.find(t => t.id === templateId);
    const isAdded = template?.cc?.includes(userId);
    
    toast({
      title: isAdded ? "CC User Added" : "CC User Removed",
      description: isAdded 
        ? `${ccUser?.name} (${ccUser?.email}) will be CC'd in this email.` 
        : `${ccUser?.name} (${ccUser?.email}) removed from CC list.`
    });
  };

  // Filter CC options based on department and country
  const filterCCOptions = (department: string, country: string) => {
    let filtered = [...ccUserOptions];
    
    if (department !== 'all') {
      filtered = filtered.filter(user => user.department === department);
    }
    
    if (country !== 'all') {
      filtered = filtered.filter(user => user.country === country);
    }
    
    if (ccSearchTerm) {
      const searchLower = ccSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCCUsers(filtered);
  };

  // Handle CC search input
  const handleCCSearch = (searchTerm: string) => {
    setCCSearchTerm(searchTerm);
    const template = templates.find(t => t.id === activeTemplate);
    filterCCOptions(template?.department || 'all', template?.country || 'all');
  };

  const getTriggerLabel = (value: string): string => {
    const option = triggerOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getRecipientLabel = (value: string): string => {
    const option = recipientOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  const getDepartmentLabel = (value: string): string => {
    const option = departmentOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  const getCountryLabel = (value: string): string => {
    const option = countryOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const isRecipientSelected = (templateId: string, recipientValue: string): boolean => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.recipients.includes(recipientValue) : false;
  };
  
  const isCCUserSelected = (templateId: string, userId: string): boolean => {
    const template = templates.find(t => t.id === templateId);
    return template?.cc ? template.cc.includes(userId) : false;
  };
  
  // Get preview of email with dynamically inserted recipient name
  const getBodyWithRecipientName = (body: string): string => {
    if (!previewRecipientRole) return body;
    
    let recipientTitle = "";
    switch(previewRecipientRole) {
      case "document-owner": 
        recipientTitle = "Document Owner";
        break;
      case "document-controller":
        recipientTitle = "Document Controller";
        break;
      case "reviewers":
        recipientTitle = "Reviewer";
        break;
      case "approvers":
        recipientTitle = "Approver";
        break;
      default:
        recipientTitle = "User";
    }
    
    return body.replace(/\[Recipient Name\]/g, `${recipientTitle}`);
  };

  const activeTemplateData = templates.find(t => t.id === activeTemplate) || templates[0];
  
  // When template changes, update filtered CC users
  useEffect(() => {
    filterCCOptions(activeTemplateData.department || 'all', activeTemplateData.country || 'all');
    setPreviewRecipientRole(activeTemplateData.recipients[0] || null);
  }, [activeTemplate]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
          <FileText className="mr-2 h-5 w-5" />
          Email Templates
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Customize email templates that are sent to users at different stages of the SOP process.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <TemplateList
              templates={templates}
              activeTemplate={activeTemplate}
              setActiveTemplate={setActiveTemplate}
              toggleTimer={toggleTimer}
            />
          </div>
          
          <div className="md:col-span-3">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <TriggerSelection
                    activeTemplateData={activeTemplateData}
                    triggerOptions={triggerOptions}
                    toggleTimer={toggleTimer}
                    updateTriggerAction={updateTriggerAction}
                  />
                  
                  <FilterOptions
                    activeTemplateData={activeTemplateData}
                    departmentOptions={departmentOptions}
                    countryOptions={countryOptions}
                    updateDepartment={updateDepartment}
                    updateCountry={updateCountry}
                  />
                  
                  <RecipientsSelection
                    activeTemplateData={activeTemplateData}
                    recipientOptions={recipientOptions}
                    filteredCCUsers={filteredCCUsers}
                    ccSearchTerm={ccSearchTerm}
                    isCCUserSelected={isCCUserSelected}
                    isRecipientSelected={isRecipientSelected}
                    getRecipientLabel={getRecipientLabel}
                    toggleRecipient={toggleRecipient}
                    toggleCCUser={toggleCCUser}
                    handleCCSearch={handleCCSearch}
                  />
                  
                  <EmailEditor
                    activeTemplateData={activeTemplateData}
                    editMode={editMode}
                    editedSubject={editedSubject}
                    editedBody={editedBody}
                    previewRecipientRole={previewRecipientRole}
                    recipientOptions={recipientOptions}
                    handleEdit={handleEdit}
                    handleSave={handleSave}
                    setEditedSubject={setEditedSubject}
                    setEditedBody={setEditedBody}
                    setPreviewRecipientRole={setPreviewRecipientRole}
                    getBodyWithRecipientName={getBodyWithRecipientName}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesTab;
