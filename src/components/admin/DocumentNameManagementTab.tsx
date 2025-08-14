
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Pencil, Save, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { documentNameService, DocumentName } from "@/services/documentNameService";
import { documentTypeService } from "@/services/documentTypeService";
import { departmentService } from "@/services/departmentService";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ExtendedDocumentName extends DocumentName {
  active?: boolean;
}

interface DocumentNameManagementTabProps {
  onDocumentNamesChange?: (names: DocumentName[]) => void;
}

const DocumentNameManagementTab: React.FC<DocumentNameManagementTabProps> = ({
  onDocumentNamesChange
}) => {
  const { toast } = useToast();
  const [documentNames, setDocumentNames] = useState<ExtendedDocumentName[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingName, setIsAddingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterDocumentType, setFilterDocumentType] = useState<string>('');

  // Form state for new/editing document names
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDocumentType, setNewDocumentType] = useState('');
  const [editingName, setEditingName] = useState<ExtendedDocumentName | null>(null);

  // Fetch departments and document types for dropdowns
  useEffect(() => {
    const fetchDepartmentsAndTypes = async () => {
      try {
        const deptData = await departmentService.getAllDepartments();
        setDepartments(deptData.map(d => d.name));

        const types = await documentTypeService.getAllDocumentTypes();
        setDocumentTypes(types.map(type => type.name));
      } catch (error) {
        console.error('Error fetching departments and document types:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Failed to load departments and document types."
        });
      }
    };
    fetchDepartmentsAndTypes();
  }, []);

  // Fetch document names
  useEffect(() => {
    fetchDocumentNames();
  }, [filterDepartment, filterDocumentType]);

  const fetchDocumentNames = async () => {
    setIsLoading(true);
    try {
      let names;
      if (filterDepartment === 'all' && !filterDocumentType) {
        names = await documentNameService.getAllDocumentNames();
      } else {
        names = await documentNameService.getFilteredDocumentNames(
          filterDepartment === 'all' ? undefined : filterDepartment, 
          filterDocumentType || undefined
        );
      }
      const extendedNames = names.map(name => ({ ...name, active: true }));
      setDocumentNames(extendedNames);

      if (onDocumentNamesChange) {
        onDocumentNamesChange(names);
      }
    } catch (error) {
      console.error('Error fetching document names:', error);
      toast({
        variant: "destructive",
        title: "Error fetching document names",
        description: "The document names could not be loaded. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter document names based on search term
  const filteredDocumentNames = documentNames.filter(name => 
    name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form fields
  const resetForm = () => {
    setNewName('');
    setNewDepartment('');
    setNewDocumentType('');
    setIsAddingName(false);
    setEditingName(null);
  };

  // Add a new document name
  const handleAddDocumentName = async () => {
    if (!newName.trim() || !newDepartment || !newDocumentType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    try {
      const newDocumentName = await documentNameService.createDocumentName(
        newName.trim(), 
        newDepartment, 
        newDocumentType
      );

      await fetchDocumentNames();
      resetForm();
      toast({
        title: "Document Name Added",
        description: `"${newName}" has been added successfully.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error adding document name:', error);
      toast({
        variant: "destructive",
        title: "Error adding document name",
        description: "The document name could not be added. Please try again later."
      });
    }
  };

  // Update an existing document name
  const handleUpdateDocumentName = async () => {
    if (!editingName || !editingName.name.trim() || !editingName.department || !editingName.document_type) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    try {
      await documentNameService.updateDocumentName(editingName.id, {
        name: editingName.name.trim(),
        department: editingName.department,
        document_type: editingName.document_type
      });

      await fetchDocumentNames();
      resetForm();
      toast({
        title: "Document Name Updated",
        description: `Document name has been updated successfully.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating document name:', error);
      toast({
        variant: "destructive",
        title: "Error updating document name",
        description: "The document name could not be updated. Please try again later."
      });
    }
  };

  // Toggle document name active status
  const handleToggleDocumentNameStatus = async (docName: ExtendedDocumentName) => {
    setIsLoading(true);
    try {
      const updatedNames = documentNames.map(n => 
        n.id === docName.id 
          ? { ...n, active: !n.active }
          : n
      );
      setDocumentNames(updatedNames);
      
      const newStatus = !docName.active ? 'activated' : 'deactivated';
      toast({
        title: "Status Updated",
        description: `${docName.name} has been ${newStatus}`
      });
    } catch (error) {
      console.error('Error toggling document name status:', error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was a problem updating the document name status."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter document type change
  const handleFilterDocumentTypeChange = (value: string) => {
    setFilterDocumentType(value === 'all_types' ? '' : value);
  };

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments.map(dept => ({ value: dept, label: dept }))
  ];

  const documentTypeFilterOptions = [
    { value: 'all_types', label: 'All Types' },
    ...documentTypes.map(type => ({ value: type, label: type }))
  ];

  const departmentSelectOptions = departments.map(dept => ({ value: dept, label: dept }));
  const documentTypeSelectOptions = documentTypes.map(type => ({ value: type, label: type }));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Document Names</CardTitle>
          <CardDescription>
            Add, edit, or remove document names across the application. These will appear in document request forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input 
                  placeholder="Search document names..." 
                  className="pl-10 w-full" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-[180px]">
                  <SearchableSelect
                    options={departmentOptions}
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                    placeholder="Select Department"
                    searchPlaceholder="Search departments..."
                    emptyMessage="No departments found."
                  />
                </div>
                
                <div className="w-[180px]">
                  <SearchableSelect
                    options={documentTypeFilterOptions}
                    value={filterDocumentType === '' ? 'all_types' : filterDocumentType}
                    onValueChange={handleFilterDocumentTypeChange}
                    placeholder="Select Document Type"
                    searchPlaceholder="Search document types..."
                    emptyMessage="No document types found."
                  />
                </div>
                
                <Button 
                  onClick={() => setIsAddingName(true)} 
                  disabled={isAddingName} 
                  className="flex items-center gap-1 ml-auto bg-[#ffa530]"
                >
                  <Plus className="h-4 w-4" /> Add Document Name
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Document Name</TableHead>
                  <TableHead className="w-[20%]">Department</TableHead>
                  <TableHead className="w-[20%]">Document Type</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingName && (
                  <TableRow>
                    <TableCell>
                      <Input 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        placeholder="Enter document name" 
                        autoFocus 
                      />
                    </TableCell>
                    <TableCell>
                      <SearchableSelect
                        options={departmentSelectOptions}
                        value={newDepartment}
                        onValueChange={setNewDepartment}
                        placeholder="Select Department"
                        searchPlaceholder="Search departments..."
                        emptyMessage="No departments found."
                      />
                    </TableCell>
                    <TableCell>
                      <SearchableSelect
                        options={documentTypeSelectOptions}
                        value={newDocumentType}
                        onValueChange={setNewDocumentType}
                        placeholder="Select Type"
                        searchPlaceholder="Search document types..."
                        emptyMessage="No document types found."
                      />
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="default" onClick={handleAddDocumentName}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetForm}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Loading document names...
                    </TableCell>
                  </TableRow>
                ) : filteredDocumentNames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No document names found. {searchTerm || filterDepartment !== 'all' || filterDocumentType ? 'Try different filter options.' : 'Add a new document name to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocumentNames.map(docName => (
                    <TableRow key={docName.id}>
                      <TableCell>
                        {editingName?.id === docName.id ? (
                          <Input 
                            value={editingName.name} 
                            onChange={e => setEditingName({ ...editingName, name: e.target.value })} 
                            autoFocus 
                          />
                        ) : (
                          docName.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingName?.id === docName.id ? (
                          <SearchableSelect
                            options={departmentSelectOptions}
                            value={editingName.department}
                            onValueChange={value => setEditingName({ ...editingName, department: value })}
                            placeholder="Select Department"
                            searchPlaceholder="Search departments..."
                            emptyMessage="No departments found."
                          />
                        ) : (
                          docName.department
                        )}
                      </TableCell>
                      <TableCell>
                        {editingName?.id === docName.id ? (
                          <SearchableSelect
                            options={documentTypeSelectOptions}
                            value={editingName.document_type}
                            onValueChange={value => setEditingName({ ...editingName, document_type: value })}
                            placeholder="Select Type"
                            searchPlaceholder="Search document types..."
                            emptyMessage="No document types found."
                          />
                        ) : (
                          docName.document_type
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={docName.active !== false}
                            onCheckedChange={() => handleToggleDocumentNameStatus(docName)}
                            disabled={isLoading || !!editingName}
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {docName.active !== false ? 'On' : 'Off'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingName?.id === docName.id ? (
                          <>
                            <Button size="sm" variant="default" onClick={handleUpdateDocumentName}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={resetForm}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setEditingName(docName)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DocumentNameManagementTab;
