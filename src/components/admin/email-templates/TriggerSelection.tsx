
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailTemplate, RecipientOption } from './types';

interface TriggerSelectionProps {
  activeTemplateData: EmailTemplate;
  triggerOptions: RecipientOption[];
  toggleTimer: (id: string) => void;
  updateTriggerAction: (id: string, action: string) => void;
}

const TriggerSelection: React.FC<TriggerSelectionProps> = ({
  activeTemplateData,
  triggerOptions,
  toggleTimer,
  updateTriggerAction
}) => {
  return (
    <div className="flex items-center space-x-4 pb-2">
      <div className="flex items-center space-x-2">
        <Switch 
          id={`timer-${activeTemplateData.id}`} 
          checked={activeTemplateData.timerEnabled} 
          onCheckedChange={() => toggleTimer(activeTemplateData.id)} 
        />
        <Label htmlFor={`timer-${activeTemplateData.id}`} className="dark:text-gray-300">
          {activeTemplateData.timerEnabled ? "Timer Enabled" : "Timer Disabled"}
        </Label>
      </div>
      
      <div className="flex-1">
        <Select 
          value={activeTemplateData.triggerAction} 
          onValueChange={value => updateTriggerAction(activeTemplateData.id, value)} 
          disabled={!activeTemplateData.timerEnabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select trigger action" />
          </SelectTrigger>
          <SelectContent>
            {triggerOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TriggerSelection;
