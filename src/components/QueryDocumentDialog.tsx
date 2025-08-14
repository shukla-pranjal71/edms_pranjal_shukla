
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle } from 'lucide-react';
import { BaseDocumentRequest } from './table/DocumentTableTypes';

interface QueryDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitQuery: (query: string) => void;
  document: BaseDocumentRequest;
}

const QueryDocumentDialog = ({
  open,
  onOpenChange,
  onSubmitQuery,
  document
}: QueryDocumentDialogProps) => {
  const [queryText, setQueryText] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!queryText.trim()) {
      toast({
        title: "Query required",
        description: "Please provide a query or question about this document.",
        variant: "destructive"
      });
      return;
    }

    onSubmitQuery(queryText);
    setQueryText('');
    onOpenChange(false);
    
    toast({
      title: "Query Submitted",
      description: "Your query has been sent to the document team."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Submit a Query
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Document: <span className="font-medium text-gray-900 dark:text-gray-200">{document.sopName}</span>
            </p>
          </div>
          
          <Label htmlFor="query">Your question or feedback:</Label>
          <Textarea 
            id="query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your question or feedback about this document..."
            className="mt-2"
            rows={5}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Query</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueryDocumentDialog;
