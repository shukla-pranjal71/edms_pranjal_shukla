import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Edit, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

// Types
export interface Permission {
  id: string;
  name: string;
  description: string;
}
export interface Role {
  id: number;
  name: string;
  permissions: string[];
  active?: boolean;
}

// Sample data
export const availablePermissions: Permission[] = [{
  id: "create_document",
  name: "Create Documents",
  description: "Can create new SOP documents"
}, {
  id: "edit_document",
  name: "Edit Documents",
  description: "Can edit existing SOP documents"
}, {
  id: "delete_document",
  name: "Delete Documents",
  description: "Can delete SOP documents"
}, {
  id: "review_document",
  name: "Review Documents",
  description: "Can review documents in the workflow"
}, {
  id: "approve_document",
  name: "Approve Documents",
  description: "Can approve documents after review"
}, {
  id: "assign_reviewers",
  name: "Assign Reviewers",
  description: "Can assign reviewers to documents"
}, {
  id: "upload_document",
  name: "Upload Documents",
  description: "Can upload document files to the system"
}, {
  id: "manage_users",
  name: "Manage Users",
  description: "Can create and edit user accounts"
}, {
  id: "manage_roles",
  name: "Manage Roles",
  description: "Can create and edit roles"
}, {
  id: "edit_templates",
  name: "Edit Email Templates",
  description: "Can edit email notification templates"
}];
export const initialRoles: Role[] = [{
  id: 1,
  name: "Admin",
  permissions: ["create_document", "edit_document", "delete_document", "review_document", "approve_document", "assign_reviewers", "manage_users", "manage_roles", "edit_templates"],
  active: true
}, {
  id: 2,
  name: "Document Controller",
  permissions: ["create_document", "edit_document", "assign_reviewers"],
  active: true
}, {
  id: 3,
  name: "Document Creator",
  permissions: ["create_document", "edit_document"],
  active: true
}, {
  id: 4,
  name: "Document Owner",
  permissions: ["edit_document", "review_document", "approve_document"],
  active: true
}, {
  id: 5,
  name: "Reviewer",
  permissions: ["review_document"],
  active: true
}];

// Component for adding a new role
interface AddRoleFormProps {
  newRole: string;
  setNewRole: (role: string) => void;
  onAddRole: () => void;
}
const AddRoleForm: React.FC<AddRoleFormProps> = ({
  newRole,
  setNewRole,
  onAddRole
}) => {
  return <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
        <Users className="mr-2 h-5 w-5" />
        Add New Role
      </h2>
      <div className="flex gap-3">
        <Input placeholder="Role Name" value={newRole} onChange={e => setNewRole(e.target.value)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        <Button onClick={onAddRole} className="bg-[#117bbc] text-slate-50">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>
    </div>;
};

// Component for displaying roles in a table
interface RolesTableProps {
  roles: Role[];
  onEdit: (id: number) => void;
  onToggleStatus: (role: Role) => void;
}
const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  onEdit,
  onToggleStatus
}) => {
  return <div className="rounded-md border dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead className="dark:text-gray-300">ID</TableHead>
            <TableHead className="dark:text-gray-300">Name</TableHead>
            <TableHead className="dark:text-gray-300">Permissions</TableHead>
            <TableHead className="dark:text-gray-300">Enabled</TableHead>
            <TableHead className="dark:text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map(role => <TableRow key={role.id} className="dark:border-gray-700">
              <TableCell className="dark:text-gray-300">{role.id}</TableCell>
              <TableCell className="dark:text-gray-300">{role.name}</TableCell>
              <TableCell>
                <PermissionBadges permissions={role.permissions} />
              </TableCell>
              <TableCell>
                <Switch checked={role.active !== false} onCheckedChange={() => onToggleStatus(role)} className="bg-[#117bbc] text-slate-50" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => onEdit(role.id)} title="Edit" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};

// Component for displaying permission badges
interface PermissionBadgesProps {
  permissions: string[];
}
const PermissionBadges: React.FC<PermissionBadgesProps> = ({
  permissions
}) => {
  if (permissions.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm">No permissions</span>;
  }
  return <div className="flex flex-wrap gap-1">
      {permissions.map(permId => {
      const perm = availablePermissions.find(p => p.id === permId);
      return perm ? <span key={permId} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md dark:bg-blue-900 dark:text-blue-200">
            {perm.name}
          </span> : null;
    })}
    </div>;
};

// Component for editing role permissions
interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onSavePermissions: () => void;
}
const EditPermissionsDialog: React.FC<EditPermissionsDialogProps> = ({
  open,
  onOpenChange,
  editingRole,
  selectedPermissions,
  onPermissionToggle,
  onSavePermissions
}) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit Role Permissions</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {editingRole && `Configure permissions for the ${editingRole.name} role.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <h3 className="font-medium dark:text-white">Available Permissions</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
            {availablePermissions.map(permission => <div key={permission.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                <div className="pt-0.5">
                  <Button variant="outline" size="icon" className={`h-6 w-6 ${selectedPermissions.includes(permission.id) ? 'bg-green-100 dark:bg-green-900 dark:border-green-700' : 'dark:bg-gray-700 dark:border-gray-600'}`} onClick={() => onPermissionToggle(permission.id)}>
                    {selectedPermissions.includes(permission.id) ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <span></span>}
                  </Button>
                </div>
                <div>
                  <div className="font-medium dark:text-white">{permission.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</div>
                </div>
              </div>)}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onSavePermissions} className="dark:text-white bg-[#117bbc]">
            <Save className="mr-2 h-4 w-4" />
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};

// Main component
const RoleManagementTab: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [newRole, setNewRole] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const {
    toast
  } = useToast();
  const handleAddRole = () => {
    if (!newRole) {
      toast({
        title: "Error",
        description: "Please enter a role name.",
        variant: "destructive"
      });
      return;
    }
    const role = {
      id: roles.length + 1,
      name: newRole,
      permissions: [],
      active: true
    };
    setRoles([...roles, role]);
    setNewRole('');
    toast({
      title: "Role Added",
      description: `${role.name} has been added.`
    });
  };
  const handleEdit = (id: number) => {
    const role = roles.find(r => r.id === id);
    if (role) {
      setEditingRole(role);
      setSelectedPermissions([...role.permissions]);
      setIsEditDialogOpen(true);
    }
  };
  const handleToggleStatus = (role: Role) => {
    const updatedRoles = roles.map(r => r.id === role.id ? {
      ...r,
      active: !r.active
    } : r);
    setRoles(updatedRoles);
    const newStatus = !role.active ? 'activated' : 'deactivated';
    toast({
      title: "Status Updated",
      description: `${role.name} has been ${newStatus}`
    });
  };
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };
  const handleSavePermissions = () => {
    if (editingRole) {
      const updatedRoles = roles.map(role => {
        if (role.id === editingRole.id) {
          return {
            ...role,
            permissions: selectedPermissions
          };
        }
        return role;
      });
      setRoles(updatedRoles);
      setIsEditDialogOpen(false);
      setEditingRole(null);
      toast({
        title: "Permissions Updated",
        description: "The role permissions have been updated successfully."
      });
    }
  };
  return <div className="space-y-6">
      <AddRoleForm newRole={newRole} setNewRole={setNewRole} onAddRole={handleAddRole} />
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Role List</h2>
        
        <RolesTable roles={roles} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
      </div>
      
      <EditPermissionsDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} editingRole={editingRole} selectedPermissions={selectedPermissions} onPermissionToggle={handlePermissionToggle} onSavePermissions={handleSavePermissions} />
    </div>;
};
export default RoleManagementTab;