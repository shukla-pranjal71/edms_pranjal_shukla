import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Pencil, Save, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { departmentService, Department } from "@/services/departmentService";
interface ExtendedDepartment extends Department {
  active?: boolean;
}
interface DepartmentManagementTabProps {
  onDepartmentsChange?: (departments: string[]) => void;
}
const DepartmentManagementTab: React.FC<DepartmentManagementTabProps> = ({
  onDepartmentsChange
}) => {
  const {
    toast
  } = useToast();
  const [departments, setDepartments] = useState<ExtendedDepartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    approverName: '',
    approverEmail: ''
  });
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<{
    id: number;
    name: string;
    approverName: string;
    approverEmail: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch departments from hardcoded data
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch all departments from hardcoded data
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await departmentService.getAllDepartments();
      const extendedData = data?.map(dept => ({
        ...dept,
        active: true
      })) || [];
      setDepartments(extendedData);

      // Notify parent component of the departments list if callback is provided
      if (onDepartmentsChange) {
        onDepartmentsChange(data?.map(dept => dept.name) || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Error fetching departments",
        description: "The departments could not be loaded. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Add a new department
  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) return;
    try {
      const newDept = await departmentService.createDepartment(newDepartment.name.trim(), newDepartment.approverName.trim() || undefined, newDepartment.approverEmail.trim() || undefined);
      if (newDept) {
        // Refresh departments from the backend
        await fetchDepartments();
        setNewDepartment({
          name: '',
          approverName: '',
          approverEmail: ''
        });
        setIsAddingDepartment(false);
        toast({
          title: "Department added",
          description: `"${newDepartment.name}" has been added to the list of departments.`
        });
      }
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        variant: "destructive",
        title: "Error adding department",
        description: "The department could not be added. Please try again later."
      });
    }
  };

  // Update an existing department
  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !editingDepartment.name.trim()) return;
    try {
      const updatedDept = await departmentService.updateDepartment(editingDepartment.id, editingDepartment.name, editingDepartment.approverName.trim() || undefined, editingDepartment.approverEmail.trim() || undefined);
      if (updatedDept) {
        // Refresh departments from the backend
        await fetchDepartments();
        setEditingDepartment(null);
        toast({
          title: "Department updated",
          description: `Department has been updated to "${editingDepartment.name}".`
        });
      }
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        variant: "destructive",
        title: "Error updating department",
        description: "The department could not be updated. Please try again later."
      });
    }
  };

  // Toggle department active status
  const handleToggleDepartmentStatus = async (department: ExtendedDepartment) => {
    setIsLoading(true);
    try {
      const updatedDepartments = departments.map(d => d.id === department.id ? {
        ...d,
        active: !d.active
      } : d);
      setDepartments(updatedDepartments);
      const newStatus = !department.active ? 'activated' : 'deactivated';
      toast({
        title: "Status Updated",
        description: `${department.name} has been ${newStatus}`
      });
    } catch (error) {
      console.error('Error toggling department status:', error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was a problem updating the department status."
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="h-full w-full flex flex-col">
      <Card className="flex-1 flex flex-col m-6">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Manage Departments</CardTitle>
          <CardDescription>
            Add, edit, or remove departments across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input placeholder="Search departments..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={() => setIsAddingDepartment(true)} disabled={isAddingDepartment} className="flex items-center gap-1 bg-[#117bbc] text-slate-50">
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>
          
          <div className="flex-1 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[30%]">Department Name</TableHead>
                  <TableHead className="w-[25%]">Approver Name</TableHead>
                  <TableHead className="w-[25%]">Approver Email</TableHead>
                  <TableHead className="w-[10%]">Enabled</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingDepartment && <TableRow>
                    <TableCell>
                      <Input value={newDepartment.name} onChange={e => setNewDepartment({
                    ...newDepartment,
                    name: e.target.value
                  })} placeholder="Enter department name" autoFocus />
                    </TableCell>
                    <TableCell>
                      <Input value={newDepartment.approverName} onChange={e => setNewDepartment({
                    ...newDepartment,
                    approverName: e.target.value
                  })} placeholder="Enter approver name" />
                    </TableCell>
                    <TableCell>
                      <Input type="email" value={newDepartment.approverEmail} onChange={e => setNewDepartment({
                    ...newDepartment,
                    approverEmail: e.target.value
                  })} placeholder="Enter approver email" />
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="default" onClick={handleAddDepartment}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingDepartment(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>}
                
                {isLoading ? <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Loading departments...
                    </TableCell>
                  </TableRow> : filteredDepartments.length === 0 ? <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No departments found. {searchTerm ? 'Try a different search term.' : 'Add a new department to get started.'}
                    </TableCell>
                  </TableRow> : filteredDepartments.map(dept => <TableRow key={dept.id}>
                      <TableCell>
                        {editingDepartment?.id === dept.id ? <Input value={editingDepartment.name} onChange={e => setEditingDepartment({
                    ...editingDepartment,
                    name: e.target.value
                  })} autoFocus /> : dept.name}
                      </TableCell>
                      <TableCell>
                        {editingDepartment?.id === dept.id ? <Input value={editingDepartment.approverName} onChange={e => setEditingDepartment({
                    ...editingDepartment,
                    approverName: e.target.value
                  })} placeholder="Enter approver name" /> : dept.approverName || '-'}
                      </TableCell>
                      <TableCell>
                        {editingDepartment?.id === dept.id ? <Input type="email" value={editingDepartment.approverEmail} onChange={e => setEditingDepartment({
                    ...editingDepartment,
                    approverEmail: e.target.value
                  })} placeholder="Enter approver email" /> : dept.approverEmail || '-'}
                      </TableCell>
                      <TableCell>
                        <Switch checked={dept.active !== false} onCheckedChange={() => handleToggleDepartmentStatus(dept)} disabled={isLoading || !!editingDepartment} className="bg-[#117bbc] text-slate-50" />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingDepartment?.id === dept.id ? <>
                            <Button size="sm" variant="default" onClick={handleUpdateDepartment}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingDepartment(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </> : <Button size="sm" variant="ghost" onClick={() => setEditingDepartment({
                    id: dept.id,
                    name: dept.name,
                    approverName: dept.approverName || '',
                    approverEmail: dept.approverEmail || ''
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
export default DepartmentManagementTab;