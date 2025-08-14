import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Pencil, Save, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { documentTypeService, DocumentType } from "@/services/documentTypeService";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { departmentService } from "@/services/departmentService";
interface ExtendedDocumentType extends DocumentType {
  active?: boolean;
}
interface DocumentTypeManagementTabProps {
  onDocumentTypesChange?: (types: string[]) => void;
}
const DocumentTypeManagementTab: React.FC<DocumentTypeManagementTabProps> = ({
  onDocumentTypesChange
}) => {
  const {
    toast
  } = useToast();
  const [documentTypes, setDocumentTypes] = useState<ExtendedDocumentType[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [newDocumentType, setNewDocumentType] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [editingType, setEditingType] = useState<{
    id: number;
    name: string;
    department?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch document types and departments from backend
  useEffect(() => {
    fetchDocumentTypes();
    fetchDepartments();
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const deptData = await departmentService.getAllDepartments();
      setDepartments(deptData.map(dept => dept.name));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch document types from the database
  const fetchDocumentTypes = async () => {
    setIsLoading(true);
    try {
      const types = await documentTypeService.getAllDocumentTypes();
      const extendedTypes = types.map(type => ({
        ...type,
        active: true
      }));
      setDocumentTypes(extendedTypes);
      if (onDocumentTypesChange) {
        onDocumentTypesChange(types.map(type => type.name));
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
      toast({
        variant: "destructive",
        title: "Error fetching document types",
        description: "The document types could not be loaded. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter document types based on search term and department
  const filteredDocumentTypes = documentTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || type.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Add a new document type
  const handleAddDocumentType = async () => {
    if (!newDocumentType.trim() || !newDepartment) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    try {
      const newType = await documentTypeService.createDocumentType(newDocumentType, newDepartment);
      if (newType) {
        await fetchDocumentTypes();
        setNewDocumentType('');
        setNewDepartment('');
        setIsAddingType(false);
        toast({
          title: "Document Type Added",
          description: `"${newDocumentType}" has been added to the list of document types.`,
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error adding document type:', error);
      toast({
        variant: "destructive",
        title: "Error adding document type",
        description: "The document type could not be added. Please try again later."
      });
    }
  };

  // Update an existing document type
  const handleUpdateDocumentType = async () => {
    if (!editingType || !editingType.name.trim() || !editingType.department) return;
    try {
      await documentTypeService.updateDocumentType(editingType.id, editingType.name, editingType.department);
      await fetchDocumentTypes();
      setEditingType(null);
      toast({
        title: "Document Type Updated",
        description: `Document type has been updated to "${editingType.name}".`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating document type:', error);
      toast({
        variant: "destructive",
        title: "Error updating document type",
        description: "The document type could not be updated. Please try again later."
      });
    }
  };

  // Toggle document type active status
  const handleToggleDocumentTypeStatus = async (docType: ExtendedDocumentType) => {
    setIsLoading(true);
    try {
      const updatedTypes = documentTypes.map(t => t.id === docType.id ? {
        ...t,
        active: !t.active
      } : t);
      setDocumentTypes(updatedTypes);
      const newStatus = !docType.active ? 'activated' : 'deactivated';
      toast({
        title: "Status Updated",
        description: `${docType.name} has been ${newStatus}`
      });
    } catch (error) {
      console.error('Error toggling document type status:', error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was a problem updating the document type status."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const departmentOptions = [{
    value: 'all',
    label: 'All Departments'
  }, ...departments.map(dept => ({
    value: dept,
    label: dept
  }))];
  const departmentSelectOptions = departments.map(dept => ({
    value: dept,
    label: dept
  }));
  return <div className="h-full w-full flex flex-col">
      <Card className="flex-1 flex flex-col m-6">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Manage Document Types</CardTitle>
          <CardDescription>
            Add, edit, or remove document types across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input placeholder="Search document types..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="w-48">
                <SearchableSelect options={departmentOptions} value={filterDepartment} onValueChange={setFilterDepartment} placeholder="Filter by Department" searchPlaceholder="Search departments..." emptyMessage="No departments found." />
              </div>
            </div>
            <Button onClick={() => setIsAddingType(true)} disabled={isAddingType} className="flex items-center gap-1 bg-[#117bbc] text-slate-50">
              <Plus className="h-4 w-4" /> Add Document Type
            </Button>
          </div>
          
          <div className="flex-1 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[40%]">Document Type Name</TableHead>
                  <TableHead className="w-[30%]">Department</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingType && <TableRow>
                    <TableCell>
                      <Input value={newDocumentType} onChange={e => setNewDocumentType(e.target.value)} placeholder="Enter document type name" autoFocus />
                    </TableCell>
                    <TableCell>
                      <SearchableSelect options={departmentSelectOptions} value={newDepartment} onValueChange={setNewDepartment} placeholder="Select Department" searchPlaceholder="Search departments..." emptyMessage="No departments found." />
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="default" onClick={handleAddDocumentType}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingType(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>}
                
                {isLoading ? <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Loading document types...
                    </TableCell>
                  </TableRow> : filteredDocumentTypes.length === 0 ? <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No document types found. {searchTerm ? 'Try a different search term.' : 'Add a new document type to get started.'}
                    </TableCell>
                  </TableRow> : filteredDocumentTypes.map(type => <TableRow key={type.id}>
                      <TableCell>
                        {editingType && editingType.id === type.id ? <Input value={editingType.name} onChange={e => setEditingType({
                    ...editingType,
                    name: e.target.value
                  })} autoFocus /> : type.name}
                      </TableCell>
                      <TableCell>
                        {editingType && editingType.id === type.id ? <SearchableSelect options={departmentSelectOptions} value={editingType.department || ''} onValueChange={value => setEditingType({
                    ...editingType,
                    department: value
                  })} placeholder="Select Department" searchPlaceholder="Search departments..." emptyMessage="No departments found." /> : type.department || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch checked={type.active !== false} onCheckedChange={() => handleToggleDocumentTypeStatus(type)} disabled={isLoading || !!editingType} className="bg-[#117bbc] text-slate-50" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {type.active !== false ? 'On' : 'Off'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingType && editingType.id === type.id ? <>
                            <Button size="sm" variant="default" onClick={handleUpdateDocumentType}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingType(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </> : <Button size="sm" variant="ghost" onClick={() => setEditingType({
                    id: type.id,
                    name: type.name,
                    department: type.department
                  })}>
                            <Pencil className="h-4 w-4" />
                          </Button>}
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default DocumentTypeManagementTab;