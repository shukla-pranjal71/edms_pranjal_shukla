
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailTemplate, RecipientOption } from './types';

interface EmailEditorProps {
  activeTemplateData: EmailTemplate;
  editMode: boolean;
  editedSubject: string;
  editedBody: string;
  previewRecipientRole: string | null;
  recipientOptions: RecipientOption[];
  handleEdit: () => void;
  handleSave: () => void;
  setEditedSubject: (subject: string) => void;
  setEditedBody: (body: string) => void;
  setPreviewRecipientRole: (role: string) => void;
  getBodyWithRecipientName: (body: string) => string;
}

const EmailEditor: React.FC<EmailEditorProps> = ({
  activeTemplateData,
  editMode,
  editedSubject,
  editedBody,
  previewRecipientRole,
  recipientOptions,
  handleEdit,
  handleSave,
  setEditedSubject,
  setEditedBody,
  setPreviewRecipientRole,
  getBodyWithRecipientName
}) => {
  return (
    <>
      <div className="pb-3 flex flex-row items-center justify-between">
        <div>
          {!editMode ? (
            <Button onClick={handleEdit} variant="outline" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
              <Edit className="mr-2 h-4 w-4" /> Edit Template
            </Button>
          ) : (
            <Button onClick={handleSave} variant="default">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium dark:text-gray-300">
            Email Preview
          </label>
          
          <Select
            value={previewRecipientRole || ''}
            onValueChange={value => setPreviewRecipientRole(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Preview as" />
            </SelectTrigger>
            <SelectContent>
              {recipientOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  Preview as {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium dark:text-gray-300">Subject</label>
          {editMode ? (
            <input 
              type="text" 
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600" 
              value={editedSubject} 
              onChange={e => setEditedSubject(e.target.value)} 
            />
          ) : (
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600 dark:text-white">
              {activeTemplateData.subject}
            </div>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium dark:text-gray-300">Body</label>
          {editMode ? (
            <textarea 
              className="w-full mt-1 p-2 border rounded-md min-h-[300px] dark:bg-gray-700 dark:text-white dark:border-gray-600" 
              value={editedBody} 
              onChange={e => setEditedBody(e.target.value)} 
            />
          ) : (
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600 whitespace-pre-line min-h-[300px] dark:text-white">
              {getBodyWithRecipientName(activeTemplateData.body)}
            </div>
          )}
        </div>
        
        <div className="pt-2 text-sm text-gray-500 dark:text-gray-400">
          <p>Available placeholders: [Document Name], [Document Code], [Recipient Name], [Uploader Name], [Upload Date], [Review Deadline], etc.</p>
        </div>
      </div>
    </>
  );
};

export default EmailEditor;
