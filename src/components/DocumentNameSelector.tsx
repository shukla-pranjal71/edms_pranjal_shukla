
import React from 'react';
import { Input } from "@/components/ui/input";

interface DocumentNameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  department?: string;
  documentType?: string;
  placeholder?: string;
  className?: string;
  showCustomEntry?: boolean;
  onCustomEntry?: (customName: string) => void;
}

const DocumentNameSelector = ({
  value,
  onChange,
  placeholder = "Enter Document Name",
  className = "",
}: DocumentNameSelectorProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium">Document Name</label>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
      />
    </div>
  );
};

export default DocumentNameSelector;
