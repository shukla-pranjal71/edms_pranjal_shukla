import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
interface DocumentLevel {
  id: string;
  value: string;
  label: string;
  active?: boolean;
  isDefault?: boolean;
}
const DocumentLevelManagementTab: React.FC = () => {
  const {
    toast
  } = useToast();
  const [documentLevels, setDocumentLevels] = useState<DocumentLevel[]>([{
    id: '1',
    value: 'all',
    label: 'All',
    active: true,
    isDefault: true
  }, {
    id: '2',
    value: 'live-cr',
    label: 'Live - CR',
    active: true
  }, {
    id: '3',
    value: 'live-published',
    label: 'Live - Published',
    active: true
  }]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({
    value: '',
    label: ''
  });
  const [editLevel, setEditLevel] = useState({
    value: '',
    label: ''
  });
  const handleAdd = () => {
    if (!newLevel.value || !newLevel.label) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    const level: DocumentLevel = {
      id: Date.now().toString(),
      value: newLevel.value.toLowerCase().replace(/\s+/g, '-'),
      label: newLevel.label,
      active: true
    };
    setDocumentLevels([...documentLevels, level]);
    setNewLevel({
      value: '',
      label: ''
    });
    setIsAdding(false);
    toast({
      title: "Success",
      description: "Document level added successfully"
    });
  };
  const handleEdit = (level: DocumentLevel) => {
    setEditingId(level.id);
    setEditLevel({
      value: level.value,
      label: level.label
    });
  };
  const handleSaveEdit = () => {
    if (!editLevel.value || !editLevel.label) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setDocumentLevels(documentLevels.map(level => level.id === editingId ? {
      ...level,
      value: editLevel.value.toLowerCase().replace(/\s+/g, '-'),
      label: editLevel.label
    } : level));
    setEditingId(null);
    setEditLevel({
      value: '',
      label: ''
    });
    toast({
      title: "Success",
      description: "Document level updated successfully"
    });
  };
  const handleToggleStatus = (level: DocumentLevel) => {
    if (level.isDefault) {
      toast({
        title: "Error",
        description: "Cannot deactivate default document level",
        variant: "destructive"
      });
      return;
    }
    setDocumentLevels(documentLevels.map(l => l.id === level.id ? {
      ...l,
      active: !l.active
    } : l));
    const newStatus = !level.active ? 'activated' : 'deactivated';
    toast({
      title: "Status Updated",
      description: `${level.label} has been ${newStatus}`
    });
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Level Control</h2>
          <p className="text-gray-600 mt-1">
            Manage document level options available in dropdown selectors throughout the application.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#117bbc] text-slate-50">
          <Plus className="h-4 w-4" />
          Add Document Level
        </Button>
      </div>

      {/* Add new document level form */}
      {isAdding && <Card>
          <CardHeader>
            <CardTitle>Add New Document Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-value">Value</Label>
                <Input id="new-value" placeholder="e.g., live-draft" value={newLevel.value} onChange={e => setNewLevel({
              ...newLevel,
              value: e.target.value
            })} />
              </div>
              <div>
                <Label htmlFor="new-label">Display Label</Label>
                <Input id="new-label" placeholder="e.g., Live - Draft" value={newLevel.label} onChange={e => setNewLevel({
              ...newLevel,
              label: e.target.value
            })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
            setIsAdding(false);
            setNewLevel({
              value: '',
              label: ''
            });
          }} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* Document levels list */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Document Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentLevels.map(level => <div key={level.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                {editingId === level.id ? <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                    <Input value={editLevel.value} onChange={e => setEditLevel({
                ...editLevel,
                value: e.target.value
              })} placeholder="Value" />
                    <Input value={editLevel.label} onChange={e => setEditLevel({
                ...editLevel,
                label: e.target.value
              })} placeholder="Display Label" />
                  </div> : <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{level.label}</p>
                        <p className="text-sm text-gray-500">Value: {level.value}</p>
                      </div>
                      {level.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                  </div>}
                
                <div className="flex items-center gap-4">
                  <Switch checked={level.active !== false} onCheckedChange={() => handleToggleStatus(level)} disabled={level.isDefault} className="bg-[#117bbc]" />
                  
                  <div className="flex gap-2">
                    {editingId === level.id ? <>
                        <Button size="sm" onClick={handleSaveEdit} className="flex items-center gap-1">
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(null);
                    setEditLevel({
                      value: '',
                      label: ''
                    });
                  }} className="flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </> : <Button size="sm" variant="outline" onClick={() => handleEdit(level)} className="flex items-center gap-1">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>}
                  </div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default DocumentLevelManagementTab;