
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
  documentName: string;
}

const QueryDialog: React.FC<QueryDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  documentName
}) => {
  const [queryText, setQueryText] = useState('');

  const handleSubmit = () => {
    if (queryText.trim()) {
      onSubmit(queryText);
      setQueryText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Query</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document-name">Document</Label>
            <div className="text-sm text-gray-600">{documentName}</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="query-text">Query/Comments *</Label>
            <Textarea
              id="query-text"
              placeholder="Please enter your query or comments about this document..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!queryText.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Submit Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueryDialog;
