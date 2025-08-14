
import React, { useState, useEffect } from 'react';
import { MultiSelectChips } from './MultiSelectChips';
import { countryService } from '@/services/countryService';
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CountrySelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  countries?: string[];
  multiSelect?: boolean;
  label?: string;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  value, 
  onChange,
  countries: propCountries,
  multiSelect = false,
  label = "Country:",
  className
}) => {
  const [countries, setCountries] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>(['all']);
  
  useEffect(() => {
    if (!propCountries) {
      fetchCountries();
    }
  }, [propCountries]);

  useEffect(() => {
    if (propCountries && propCountries.length > 0) {
      const sortedCountries = ['all', ...propCountries.filter(c => c !== 'all').sort()];
      setCountries(sortedCountries);
    }
  }, [propCountries]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(
        country => country.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (country === 'all' && 'all countries'.includes(searchTerm.toLowerCase()))
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const countryList = await countryService.getAllCountries();
      
      const countryNames = countryList.map(country => country.name) || [];
      const sortedCountries = ['all', ...countryNames.sort()];
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      const fallbackCountries = ['all', 'BHR', 'EGY', 'KSA', 'OMN', 'UAE'];
      setCountries(fallbackCountries);
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
        options={countries}
        value={Array.isArray(normalizedValue) ? normalizedValue : []}
        onChange={handleChange}
        placeholder="Select countries"
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
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center border-b px-3 pb-2 mb-2 dark:border-gray-700">
              <Search className="w-4 h-4 mr-2 opacity-50 dark:text-gray-400" />
              <Input 
                placeholder="Search countries..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 pl-0 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <ScrollArea className="h-48">
              {filteredCountries.map((country) => (
                <SelectItem 
                  key={country} 
                  value={country} 
                  className="dark:text-white"
                >
                  {country === 'all' ? 'All Countries' : country}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CountrySelector;
