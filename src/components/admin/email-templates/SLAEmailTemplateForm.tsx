
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EmailTemplate } from "./types";

interface SLAEmailTemplateFormProps {
  template: EmailTemplate;
  onUpdate: (field: keyof EmailTemplate, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SLAEmailTemplateForm: React.FC<SLAEmailTemplateFormProps> = ({
  template,
  onUpdate,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={template.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          value={template.subject}
          onChange={(e) => onUpdate("subject", e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="body">Email Body</Label>
        <Textarea
          id="body"
          value={template.body}
          onChange={(e) => onUpdate("body", e.target.value)}
          className="mt-1 h-40"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use {"{recipientName}"} to personalize for the recipient
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="timer">Timer Enabled</Label>
          <p className="text-xs text-gray-500">
            Send reminder emails automatically
          </p>
        </div>
        <Switch
          id="timer"
          checked={template.timerEnabled}
          onCheckedChange={(checked) => onUpdate("timerEnabled", checked)}
        />
      </div>
      
      {template.timerEnabled && (
        <div>
          <Label htmlFor="slaPeriod">SLA Period (days)</Label>
          <Input
            id="slaPeriod"
            type="number"
            min="1"
            value={template.slaPeriod || ""}
            onChange={(e) => onUpdate("slaPeriod", parseInt(e.target.value) || "")}
            className="mt-1 w-full"
            placeholder="Enter number of days"
          />
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save Template</Button>
      </div>
    </div>
  );
};

export default SLAEmailTemplateForm;
