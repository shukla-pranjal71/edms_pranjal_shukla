import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserCheck, Pencil, Save, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
interface ComplianceContact {
  id: string;
  name: string;
  email: string;
  active?: boolean;
}
const ComplianceContactsTab: React.FC = () => {
  const {
    toast
  } = useToast();
  const [contacts, setContacts] = useState<ComplianceContact[]>([{
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    active: true
  }, {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    active: true
  }]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: ''
  });
  const [editingContact, setEditingContact] = useState<ComplianceContact | null>(null);
  const addContact = () => {
    if (newContact.name.trim() && newContact.email.trim()) {
      const contact: ComplianceContact = {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        active: true
      };
      setContacts([...contacts, contact]);
      setNewContact({
        name: '',
        email: ''
      });
      toast({
        title: "Contact Added",
        description: `${contact.name} has been added to compliance contacts.`
      });
    }
  };
  const handleToggleContactStatus = (contact: ComplianceContact) => {
    const updatedContacts = contacts.map(c => c.id === contact.id ? {
      ...c,
      active: !c.active
    } : c);
    setContacts(updatedContacts);
    const newStatus = !contact.active ? 'activated' : 'deactivated';
    toast({
      title: "Status Updated",
      description: `${contact.name} has been ${newStatus}`
    });
  };
  const startEditing = (contact: ComplianceContact) => {
    setEditingContact({
      ...contact
    });
  };
  const saveEdit = () => {
    if (!editingContact || !editingContact.name.trim() || !editingContact.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
    setEditingContact(null);
    toast({
      title: "Contact Updated",
      description: `${editingContact.name} has been updated successfully.`
    });
  };
  const cancelEdit = () => {
    setEditingContact(null);
  };
  return <div className="space-y-6">
      {/* Add New Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Compliance Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" placeholder="Enter full name" value={newContact.name} onChange={e => setNewContact({
              ...newContact,
              name: e.target.value
            })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="Enter email address" value={newContact.email} onChange={e => setNewContact({
              ...newContact,
              email: e.target.value
            })} />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={addContact} className="w-full md:w-auto bg-[#117bbc] text-slate-50">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Current Compliance Contacts ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No compliance contacts added yet.</p>
            </div> : <div className="space-y-3">
              {contacts.map(contact => <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    {editingContact?.id === contact.id ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input value={editingContact.name} onChange={e => setEditingContact({
                  ...editingContact,
                  name: e.target.value
                })} placeholder="Enter name" />
                        <Input type="email" value={editingContact.email} onChange={e => setEditingContact({
                  ...editingContact,
                  email: e.target.value
                })} placeholder="Enter email" />
                      </div> : <>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </>}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <Switch checked={contact.active !== false} onCheckedChange={() => handleToggleContactStatus(contact)} disabled={!!editingContact} className="bg-[#117bbc] text-slate-50" />
                    <div className="flex gap-2">
                      {editingContact?.id === contact.id ? <>
                          <Button variant="outline" size="sm" onClick={saveEdit} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit} className="text-gray-600 hover:text-gray-700">
                            <X className="h-4 w-4" />
                          </Button>
                        </> : <Button variant="outline" size="sm" onClick={() => startEditing(contact)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>}
                    </div>
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default ComplianceContactsTab;