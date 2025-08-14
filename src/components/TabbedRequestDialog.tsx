
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, FileText } from 'lucide-react';
import NewRequestForm from './NewRequestForm';
import ChangeRequestForm from './ChangeRequestForm';
import { NewRequest } from './NewRequestForm';
import { ChangeRequest } from './ChangeRequestForm';
import { BaseDocumentRequest } from './table/DocumentTableTypes';

interface TabbedRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitChangeRequest: (request: Partial<ChangeRequest>, attachment?: File) => void;
  onSubmitNewRequest: (request: Partial<NewRequest>, attachment?: File) => void;
  documents: BaseDocumentRequest[];
}

const TabbedRequestDialog: React.FC<TabbedRequestDialogProps> = ({
  open,
  onOpenChange,
  onSubmitChangeRequest,
  onSubmitNewRequest,
  documents
}) => {
  const [activeTab, setActiveTab] = useState("new-request");

  useEffect(() => {
    console.log('TabbedRequestDialog - open state changed:', open);
  }, [open]);

  const handleNewRequestSubmit = (request: Partial<NewRequest>, attachment?: File) => {
    console.log('TabbedRequestDialog - New request submitted:', request);
    console.log('TabbedRequestDialog - New request attachment:', attachment);
    onSubmitNewRequest(request, attachment);
  };

  const handleChangeRequestSubmit = (request: Partial<ChangeRequest>, attachment?: File) => {
    console.log('TabbedRequestDialog - Change request submitted:', request);
    console.log('TabbedRequestDialog - Change request attachment:', attachment);
    onSubmitChangeRequest(request, attachment);
  };

  console.log('TabbedRequestDialog rendering with open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Submit Request</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-request" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Request
            </TabsTrigger>
            <TabsTrigger value="change-request" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Change Request
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[70vh]">
            <TabsContent value="new-request" className="mt-4">
              <NewRequestForm
                open={true}
                onOpenChange={() => {}}
                onSubmit={handleNewRequestSubmit}
                embedded={true}
              />
            </TabsContent>

            <TabsContent value="change-request" className="mt-4">
              <ChangeRequestForm
                open={true}
                onOpenChange={() => {}}
                onSubmit={handleChangeRequestSubmit}
                documents={documents}
                embedded={true}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TabbedRequestDialog;
