
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MultiSelectChipsProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  includeAllOption?: boolean;
}

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  label,
  className,
  disabled = false,
  includeAllOption = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option === 'all' && 'all'.includes(searchTerm.toLowerCase()))
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (option === 'all') {
      // If "all" is selected, clear other selections or select all
      if (value.includes('all')) {
        onChange([]);
      } else {
        onChange(['all']);
      }
    } else {
      // Remove "all" if selecting individual items
      const newValue = value.filter(v => v !== 'all');
      
      if (newValue.includes(option)) {
        onChange(newValue.filter(v => v !== option));
      } else {
        onChange([...newValue, option]);
      }
    }
  };

  const handleRemoveChip = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  const getDisplayValue = () => {
    if (value.includes('all')) {
      return 'All Selected';
    }
    if (value.length === 0) {
      return placeholder;
    }
    return `${value.length} selected`;
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Selected chips display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((item) => (
            <div
              key={item}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs"
            >
              <span>{item === 'all' ? 'All' : item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveChip(item)}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal",
          !value.length && "text-muted-foreground",
          "dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        )}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
          </div>
          
          <ScrollArea className="h-48">
            <div className="p-1">
              {includeAllOption && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                    value.includes('all') && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => handleToggleOption('all')}
                >
                  <Checkbox
                    checked={value.includes('all')}
                    onChange={() => handleToggleOption('all')}
                  />
                  <span className="text-gray-900 dark:text-white">All</span>
                </div>
              )}
              
              {filteredOptions
                .filter(option => option !== 'all')
                .map((option) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                      value.includes(option) && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleToggleOption(option)}
                  >
                    <Checkbox
                      checked={value.includes(option)}
                      onChange={() => handleToggleOption(option)}
                    />
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                ))}
              
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No items found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
