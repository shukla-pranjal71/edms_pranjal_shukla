
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDocumentRequest } from "./table/DocumentTableTypes";
import DialogCloseButton from './ui/dialog-close-button';
import ConfirmActionDialog from './ConfirmActionDialog';
import { BellRing } from 'lucide-react';

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: BaseDocumentRequest;
  onSendNotification: (role: string) => void;
  userRole?: string;
}

const allRoles = [
  { id: 'document-controller', name: 'Document Controller' },
  { id: 'document-owner', name: 'Document Owner' },
  { id: 'reviewer', name: 'Reviewer' },
  { id: 'requester', name: 'Requester' },
  { id: 'admin', name: 'Admin' },
  { id: 'all', name: 'All Users' }
];

const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({
  open,
  onOpenChange,
  document,
  onSendNotification,
  userRole = 'document-controller'
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRoleSelect = (value: string) => {
    setSelectedRole(value);
  };

  const handleSendClick = () => {
    if (selectedRole) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSend = () => {
    onSendNotification(selectedRole);
    setShowConfirmDialog(false);
    onOpenChange(false);
  };

  // Filter roles based on user role
  const roles = userRole === 'document-owner' 
    ? allRoles.filter(role => role.id === 'reviewer' || role.id === 'all')
    : allRoles;

  const getSelectedRoleName = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.name : selectedRole;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Document</p>
              <p className="text-sm">{document.documentCode}: {document.sopName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Recipients</p>
              <Select value={selectedRole} onValueChange={handleRoleSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role to notify" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSendClick}
              disabled={!selectedRole}
              className="gap-2"
            >
              <BellRing className="h-4 w-4" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSend}
        title="Confirm Reminder"
        description={`Are you sure you want to send a reminder to ${getSelectedRoleName()}?`}
        actionLabel="Send"
      />
    </>
  );
};

export default SendNotificationDialog;
