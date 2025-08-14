
import React, { useState, useEffect } from 'react';
import { MultiSelectChips } from './MultiSelectChips';
import { departmentService } from '@/services/departmentService';
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DepartmentSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  departments?: string[];
  multiSelect?: boolean;
  label?: string;
  className?: string;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  value, 
  onChange,
  departments: propDepartments,
  multiSelect = false,
  label = "Department:",
  className
}) => {
  const [departments, setDepartments] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>(['all']);
  
  useEffect(() => {
    if (!propDepartments) {
      fetchDepartments();
    }
  }, [propDepartments]);

  useEffect(() => {
    if (propDepartments && propDepartments.length > 0) {
      const sortedDepartments = ['all', ...propDepartments.filter(d => d !== 'all').sort()];
      setDepartments(sortedDepartments);
    }
  }, [propDepartments]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(
        department => department.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     (department === 'all' && 'all departments'.includes(searchTerm.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const departmentList = await departmentService.getAllDepartments();
      
      const departmentNames = departmentList.map(dept => dept.name) || [];
      const sortedDepartments = ['all', ...departmentNames.sort()];
      setDepartments(sortedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      const fallbackDepartments = ['all', 'Finance', 'HR', 'IT', 'Legal', 'Marketing', 'Operations', 'R&D', 'Sales', 'Supply Chain'];
      setDepartments(fallbackDepartments);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert single value to array for multi-select
  const normalizedValue = multiSelect 
    ? (Array.isArray(value) ? value : [value].filter(Boolean))
    : value;

  const handleChange = (newValue: string | string[]) => {
    if (multiSelect) {
      onChange(Array.isArray(newValue) ? newValue : [newValue]);
    } else {
      onChange(Array.isArray(newValue) ? newValue[0] || 'all' : newValue);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (multiSelect) {
    return (
      <MultiSelectChips
        options={departments}
        value={Array.isArray(normalizedValue) ? normalizedValue : []}
        onChange={handleChange}
        placeholder="Select departments"
        label={label}
        disabled={isLoading}
        className={className}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium dark:text-gray-300">{label}</span>
      <div className="w-40">
        <Select value={typeof value === 'string' ? value : 'all'} onValueChange={onChange as (value: string) => void} disabled={isLoading}>
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center border-b px-3 pb-2 mb-2 dark:border-gray-700">
              <Search className="w-4 h-4 mr-2 opacity-50 dark:text-gray-400" />
              <Input 
                placeholder="Search departments..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <ScrollArea className="h-48">
              {filteredDepartments.map((department) => (
                <SelectItem 
                  key={department} 
                  value={department} 
                  className="dark:text-white"
                >
                  {department === 'all' ? 'All Departments' : department}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DepartmentSelector;
