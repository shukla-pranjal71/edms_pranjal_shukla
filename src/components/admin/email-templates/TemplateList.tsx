
import React from 'react';
import { Button } from "@/components/ui/button";
import { Timer, TimerOff } from "lucide-react";
import { EmailTemplate } from './types';

interface TemplateListProps {
  templates: EmailTemplate[];
  activeTemplate: string;
  setActiveTemplate: (id: string) => void;
  toggleTimer: (id: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  activeTemplate,
  setActiveTemplate,
  toggleTimer
}) => {
  return (
    <div className="border rounded-md dark:border-gray-700">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 font-medium dark:text-white">
        Template List
      </div>
      <div className="divide-y dark:divide-gray-700">
        {templates.map(template => (
          <div key={template.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
            <button 
              className={`text-left flex-1 ${activeTemplate === template.id ? 'font-medium text-primary dark:text-primary-foreground' : 'dark:text-gray-300'}`} 
              onClick={() => setActiveTemplate(template.id)}
            >
              {template.name}
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleTimer(template.id)} 
              className="ml-2" 
              title={template.timerEnabled ? "Disable automatic sending" : "Enable automatic sending"}
            >
              {template.timerEnabled 
                ? <Timer className="h-4 w-4 text-green-500" /> 
                : <TimerOff className="h-4 w-4 text-gray-400" />
              }
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateList;
