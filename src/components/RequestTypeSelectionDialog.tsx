
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Edit3 } from 'lucide-react';

interface RequestTypeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChangeRequest: () => void;
  onSelectNewRequest: () => void;
}

const RequestTypeSelectionDialog: React.FC<RequestTypeSelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectChangeRequest,
  onSelectNewRequest
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Request Type</DialogTitle>
          <DialogDescription>
            Choose the type of request you would like to submit
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={onSelectChangeRequest}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Edit3 className="h-5 w-5" />
                Change Request
              </CardTitle>
              <CardDescription>
                Request changes to an existing document or process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Select Change Request
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={onSelectNewRequest}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                New Request
              </CardTitle>
              <CardDescription>
                Request creation of a new document or process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Select New Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestTypeSelectionDialog;
