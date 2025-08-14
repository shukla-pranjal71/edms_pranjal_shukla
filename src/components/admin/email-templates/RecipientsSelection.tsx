
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailTemplate, RecipientOption, CCUser } from './types';

interface RecipientsSelectionProps {
  activeTemplateData: EmailTemplate;
  recipientOptions: RecipientOption[];
  filteredCCUsers: CCUser[];
  ccSearchTerm: string;
  isCCUserSelected: (templateId: string, userId: string) => boolean;
  isRecipientSelected: (templateId: string, recipientValue: string) => boolean;
  getRecipientLabel: (value: string) => string;
  toggleRecipient: (templateId: string, recipientValue: string) => void;
  toggleCCUser: (templateId: string, userId: string) => void;
  handleCCSearch: (searchTerm: string) => void;
}

const RecipientsSelection: React.FC<RecipientsSelectionProps> = ({
  activeTemplateData,
  recipientOptions,
  filteredCCUsers,
  ccSearchTerm,
  isCCUserSelected,
  isRecipientSelected,
  getRecipientLabel,
  toggleRecipient,
  toggleCCUser,
  handleCCSearch
}) => {
  // Sort recipient options alphabetically
  const sortedRecipientOptions = React.useMemo(() => {
    return [...recipientOptions].sort((a, b) => a.label.localeCompare(b.label));
  }, [recipientOptions]);

  // Sort CC users alphabetically
  const sortedCCUsers = React.useMemo(() => {
    return [...filteredCCUsers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCCUsers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
      {/* Send To dropdown */}
      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
              <Users className="mr-2 h-4 w-4" /> Send To ({activeTemplateData.recipients.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-gray-800">
            <ScrollArea className="h-48">
              {sortedRecipientOptions.map(option => (
                <DropdownMenuCheckboxItem 
                  key={option.value} 
                  checked={isRecipientSelected(activeTemplateData.id, option.value)} 
                  onCheckedChange={() => toggleRecipient(activeTemplateData.id, option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {activeTemplateData.recipients.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {activeTemplateData.recipients.sort().map(r => (
              <Badge key={r} variant="outline" className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20">
                {getRecipientLabel(r)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* CC dropdown */}
      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
              <UserPlus className="mr-2 h-4 w-4" /> CC List ({activeTemplateData.cc?.length || 0})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-white dark:bg-gray-800">
            <div className="p-2">
              <Input
                placeholder="Search users..."
                value={ccSearchTerm}
                onChange={(e) => handleCCSearch(e.target.value)}
                className="mb-2"
              />
            </div>
            <ScrollArea className="h-64">
              {sortedCCUsers.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500">No users found</div>
              ) : (
                sortedCCUsers.map(user => (
                  <DropdownMenuCheckboxItem 
                    key={user.id} 
                    checked={isCCUserSelected(activeTemplateData.id, user.id)} 
                    onCheckedChange={() => toggleCCUser(activeTemplateData.id, user.id)}
                    className="py-2"
                  >
                    <div>
                      <div>{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.department}, {user.country}</div>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {activeTemplateData.cc && activeTemplateData.cc.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {activeTemplateData.cc.sort().map(userId => {
              const user = filteredCCUsers.find(u => u.id === userId) || 
                           { id: userId, name: "Unknown User", email: "", department: "", country: "" };
              return (
                <Badge key={userId} variant="outline" className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/20 flex items-center gap-1">
                  <span className="text-xs truncate max-w-32">{user.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 hover:bg-transparent" 
                    onClick={() => toggleCCUser(activeTemplateData.id, userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientsSelection;
