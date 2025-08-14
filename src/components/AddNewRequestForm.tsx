import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface NewRequestData {
  id: string;
  requestTitle: string;
  requestType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requesterName: string;
  requesterEmail: string;
  targetDate?: Date;
  description: string;
  justification: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface AddNewRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Partial<NewRequestData>) => void;
}

const AddNewRequestForm: React.FC<AddNewRequestFormProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');

  const requestTypes = [
    'Process Improvement',
    'System Access',
    'Training Request',
    'Resource Allocation',
    'Policy Clarification',
    'Other'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = () => {
    if (!requestTitle || !requestType || !requesterName || !requesterEmail || !description) {
      console.error("Missing required fields");
      return;
    }

    const newRequest: Partial<NewRequestData> = {
      requestTitle,
      requestType,
      priority,
      requesterName,
      requesterEmail,
      targetDate,
      description,
      justification,
      status: 'draft'
    };

    onSubmit(newRequest);
    clearForm();
    onOpenChange(false);
  };

  const clearForm = () => {
    setRequestTitle('');
    setRequestType('');
    setPriority('medium');
    setRequesterName('');
    setRequesterEmail('');
    setTargetDate(undefined);
    setDescription('');
    setJustification('');
  };

  const handleCancel = () => {
    clearForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Request</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="requestTitle">Request Title *</Label>
              <Input
                id="requestTitle"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="Enter request title"
              />
            </div>
            <div>
              <Label htmlFor="requestType">Request Type *</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high' | 'urgent')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="requesterName">Requester Name *</Label>
              <Input
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="requesterEmail">Requester Email *</Label>
              <Input
                id="requesterEmail"
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your request"
              className="resize-none min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="justification">Justification</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide justification for this request"
              className="resize-none min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewRequestForm;