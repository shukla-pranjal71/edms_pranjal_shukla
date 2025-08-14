import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Person {
  name: string;
  email: string;
  id: string;
}

interface PeopleFieldProps {
  label?: string;
  people: Person[];
  onChange: (people: Person[]) => void;
  className?: string;
  placeholder?: string;
  showUserDropdown?: boolean;
}

const PeopleField = ({
  label,
  people,
  onChange,
  className,
  placeholder,
  showUserDropdown = true,
}: PeopleFieldProps) => {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const addPerson = () => {
    if (newName.trim() && newEmail.trim()) {
      const newPerson: Person = {
        name: newName,
        email: newEmail,
        id: Date.now().toString(),
      };
      onChange([...people, newPerson]);
      setNewName("");
      setNewEmail("");
    }
  };

  const removePerson = (id: string) => {
    onChange(people.filter((person) => person.id !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      {/* Display selected people */}
      <div className="space-y-2">
        {people.map((person) => (
          <div
            key={person.id}
            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
          >
            <div className="flex-1 text-sm">
              <div className="font-medium">{person.name}</div>
              <div className="text-gray-500">{person.email}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePerson(person.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Simple manual input */}
      <div className="flex items-end gap-2">
        <div className="grid flex-1 gap-2">
          <Label htmlFor={`${label || "person"}-name`} className="sr-only">
            Name
          </Label>
          <Input
            id={`${label || "person"}-name`}
            placeholder={placeholder ? `${placeholder} Name` : "Name"}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor={`${label || "person"}-email`} className="sr-only">
            Email
          </Label>
          <Input
            id={`${label || "person"}-email`}
            type="email"
            placeholder={placeholder ? `${placeholder} Email` : "Email"}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <Button
          type="button"
          size="icon"
          onClick={addPerson}
          disabled={!newName.trim() || !newEmail.trim()}
          className="h-10 w-10 shrink-0 bg-[#ffa530]"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </div>
    </div>
  );
};

export default PeopleField;
