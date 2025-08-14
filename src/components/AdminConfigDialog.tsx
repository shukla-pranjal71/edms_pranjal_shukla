
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AdminConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: AdminConfig) => void;
  initialConfig: AdminConfig;
}

export interface AdminConfig {
  reviewTimelineDays: number;
}

const AdminConfigDialog = ({ open, onOpenChange, onSave, initialConfig }: AdminConfigDialogProps) => {
  const { toast } = useToast();
  const [reviewTimelineDays, setReviewTimelineDays] = useState(initialConfig.reviewTimelineDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewTimelineDays <= 0) {
      toast({
        title: "Invalid value",
        description: "Review timeline must be greater than 0 days",
        variant: "destructive",
      });
      return;
    }

    onSave({ reviewTimelineDays });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Admin Configuration</DialogTitle>
          <DialogDescription>
            Configure system-wide settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="review-timeline">Review Timeline (days)</Label>
            <Input
              id="review-timeline"
              type="number"
              min="1"
              value={reviewTimelineDays}
              onChange={(e) => setReviewTimelineDays(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">Save Configuration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminConfigDialog;
