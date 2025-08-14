
import React, { useState, useEffect } from 'react';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

interface ComplianceContact {
  id: string;
  name: string;
  email: string;
}

interface ComplianceContactSelectorProps {
  value: string[];
  onChange: (contacts: ComplianceContact[]) => void;
  className?: string;
}

const ComplianceContactSelector: React.FC<ComplianceContactSelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [contacts, setContacts] = useState<ComplianceContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(value);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComplianceContacts = async () => {
      try {
        setIsLoading(true);
        const adminContacts = [
          { id: '1', name: 'Emma Davis', email: 'emma.davis@company.com' },
          { id: '2', name: 'John Smith', email: 'john.smith@company.com' },
          { id: '3', name: 'Michael Chen', email: 'michael.chen@company.com' },
          { id: '4', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' }
        ];
        
        // Sort contacts alphabetically by name
        const sortedContacts = adminContacts.sort((a, b) => a.name.localeCompare(b.name));
        setContacts(sortedContacts);
      } catch (error) {
        console.error('Error loading compliance contacts:', error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplianceContacts();
  }, []);

  const handleContactChange = (contactId: string) => {
    let newSelectedIds: string[];
    
    if (selectedContactIds.includes(contactId)) {
      newSelectedIds = selectedContactIds.filter(id => id !== contactId);
    } else {
      newSelectedIds = [...selectedContactIds, contactId];
    }
    
    setSelectedContactIds(newSelectedIds);
    
    const selectedContacts = contacts.filter(contact => 
      newSelectedIds.includes(contact.id)
    );
    
    onChange(selectedContacts);
  };

  const contactOptions: SearchableSelectOption[] = contacts.map(contact => ({
    value: contact.id,
    label: `${contact.name} (${contact.email})`
  }));

  const getSelectedContactsDisplay = () => {
    const selectedContacts = contacts.filter(contact => 
      selectedContactIds.includes(contact.id)
    );
    
    if (selectedContacts.length === 0) return "Select compliance contacts";
    if (selectedContacts.length === 1) return selectedContacts[0].name;
    return `${selectedContacts.length} contacts selected`;
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-sm font-medium">Compliance Contacts</label>
        <div className="h-9 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium">Compliance Contacts</label>
      <SearchableSelect
        options={contactOptions}
        value={selectedContactIds[0] || ''}
        onValueChange={handleContactChange}
        placeholder={getSelectedContactsDisplay()}
        searchPlaceholder="Search compliance contacts..."
        emptyMessage="No compliance contacts found."
      />
      {selectedContactIds.length > 0 && (
        <div className="text-xs text-gray-600 mt-1">
          {contacts
            .filter(contact => selectedContactIds.includes(contact.id))
            .map(contact => contact.name)
            .sort()
            .join(', ')}
        </div>
      )}
    </div>
  );
};

export default ComplianceContactSelector;
