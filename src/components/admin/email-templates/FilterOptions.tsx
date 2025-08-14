
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailTemplate, RecipientOption } from './types';

interface FilterOptionsProps {
  activeTemplateData: EmailTemplate;
  departmentOptions: RecipientOption[];
  countryOptions: RecipientOption[];
  updateDepartment: (id: string, department: string) => void;
  updateCountry: (id: string, country: string) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  activeTemplateData,
  departmentOptions,
  countryOptions,
  updateDepartment,
  updateCountry
}) => {
  const [departmentSearch, setDepartmentSearch] = React.useState('');
  const [countrySearch, setCountrySearch] = React.useState('');

  const filteredDepartments = React.useMemo(() => {
    const filtered = departmentOptions.filter(option => 
      option.label.toLowerCase().includes(departmentSearch.toLowerCase())
    );
    return filtered.sort((a, b) => a.label.localeCompare(b.label));
  }, [departmentOptions, departmentSearch]);

  const filteredCountries = React.useMemo(() => {
    const filtered = countryOptions.filter(option => 
      option.label.toLowerCase().includes(countrySearch.toLowerCase())
    );
    return filtered.sort((a, b) => a.label.localeCompare(b.label));
  }, [countryOptions, countrySearch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-2 border-y border-gray-200 dark:border-gray-700">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Department</label>
        <Select 
          value={activeTemplateData.department || 'all'} 
          onValueChange={value => updateDepartment(activeTemplateData.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center border-b px-3 pb-2 mb-2 dark:border-gray-700">
              <Search className="w-4 h-4 mr-2 opacity-50 dark:text-gray-400" />
              <Input 
                placeholder="Search departments..." 
                value={departmentSearch}
                onChange={(e) => setDepartmentSearch(e.target.value)}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <ScrollArea className="h-52">
              {filteredDepartments.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Country</label>
        <Select 
          value={activeTemplateData.country || 'all'} 
          onValueChange={value => updateCountry(activeTemplateData.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center border-b px-3 pb-2 mb-2 dark:border-gray-700">
              <Search className="w-4 h-4 mr-2 opacity-50 dark:text-gray-400" />
              <Input 
                placeholder="Search countries..." 
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <ScrollArea className="h-40">
              {filteredCountries.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterOptions;
