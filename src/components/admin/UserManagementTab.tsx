import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, User, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countryService } from '@/services/countryService';
import { departmentService } from '@/services/departmentService';
import { realtimeService } from '@/services/realtimeService';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  slaDays: string;
  country: string;
  department: string;
  employeeCode: string;
  active?: boolean;
}

// Hardcoded users data for static version
const hardcodedUsers: UserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    slaDays: "5",
    country: "UAE",
    department: "IT",
    employeeCode: "EMP001",
    active: true
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Document Owner",
    slaDays: "3",
    country: "KSA",
    department: "HR",
    employeeCode: "EMP002",
    active: true
  }
];

const UserManagementTab = () => {
  const [users, setUsers] = useState<UserData[]>(hardcodedUsers);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Reviewer',
    slaDays: '',
    country: '',
    department: '',
    employeeCode: ''
  });
  
  // State for countries and departments from database
  const [countries, setCountries] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  
  // State for search within dropdowns
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  
  // Filtered lists for dropdowns
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Fetch countries and departments and subscribe to realtime updates
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryList = await countryService.getAllCountries();
        const countryNames = countryList.map(country => country.name);
        setCountries(countryNames);
        setFilteredCountries(countryNames);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);
        setFilteredCountries([]);
      }
    };
    
    const fetchDepartments = async () => {
      try {
        const departmentList = await departmentService.getAllDepartments();
        const departmentNames = departmentList.map(dept => dept.name);
        setDepartments(departmentNames);
        setFilteredDepartments(departmentNames);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
        setFilteredDepartments([]);
      }
    };

    fetchCountries();
    fetchDepartments();
    
    // Subscribe to realtime updates
    const countriesUnsubscribe = realtimeService.subscribeToCountries(() => {
      console.log("Countries list updated, refreshing data...");
      fetchCountries();
    });
    
    const departmentsUnsubscribe = realtimeService.subscribeToDepartments(() => {
      console.log("Departments list updated, refreshing data...");
      fetchDepartments();
    });
    
    return () => {
      countriesUnsubscribe();
      departmentsUnsubscribe();
    };
  }, []);
  
  // Update filtered country list when search term changes
  useEffect(() => {
    if (countrySearchTerm === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(countrySearchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearchTerm, countries]);
  
  useEffect(() => {
    if (departmentSearchTerm === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(dept => 
        dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  }, [departmentSearchTerm, departments]);
  
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.slaDays || !newUser.department || !newUser.country || !newUser.employeeCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check for duplicate employee code
      const existingUser = users.find(user => user.employeeCode === newUser.employeeCode);
      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this employee code already exists",
          variant: "destructive"
        });
        return;
      }

      // Check for duplicate email
      const existingEmail = users.find(user => user.email === newUser.email);
      if (existingEmail) {
        toast({
          title: "Error", 
          description: "A user with this email already exists",
          variant: "destructive"
        });
        return;
      }

      // Create new user
      const addedUser: UserData = {
        id: (users.length + 1).toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        slaDays: newUser.slaDays,
        country: newUser.country,
        department: newUser.department,
        employeeCode: newUser.employeeCode,
        active: true
      };

      setUsers([...users, addedUser]);
      setNewUser({
        name: '',
        email: '',
        role: 'Reviewer',
        slaDays: '',
        country: '',
        department: '',
        employeeCode: ''
      });
      
      toast({
        title: "User Added",
        description: `${addedUser.name} has been added successfully.`
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: string) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // Check for duplicate employee code (excluding current user)
      const existingUser = users.find(user => user.employeeCode === editingUser.employeeCode && user.id !== editingUser.id);
      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this employee code already exists",
          variant: "destructive"
        });
        return;
      }

      // Check for duplicate email (excluding current user)
      const existingEmail = users.find(user => user.email === editingUser.email && user.id !== editingUser.id);
      if (existingEmail) {
        toast({
          title: "Error",
          description: "A user with this email already exists",
          variant: "destructive"
        });
        return;
      }

      // Update the user in state
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));

      setEditingUser(null);
      
      toast({
        title: "User Updated",
        description: `${editingUser.name}'s information has been updated.`
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Failed to update user",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handleToggleUserStatus = (user: UserData) => {
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, active: !u.active }
        : u
    );
    setUsers(updatedUsers);
    
    const newStatus = !user.active ? 'activated' : 'deactivated';
    toast({
      title: "Status Updated",
      description: `${user.name} has been ${newStatus}`
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Add User Form - Full Width */}
      <div className="w-full bg-white dark:bg-gray-800 p-8 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center dark:text-white">
          <User className="mr-2 h-5 w-5" />
          Add New User
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <Input 
              placeholder="Full Name" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Employee Code</label>
            <Input 
              placeholder="Employee Code" 
              value={newUser.employeeCode}
              onChange={(e) => setNewUser({...newUser, employeeCode: e.target.value})}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
            <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Document Controller">Document Controller</SelectItem>
                <SelectItem value="Document Owner">Document Owner</SelectItem>
                <SelectItem value="Reviewer">Reviewer</SelectItem>
                <SelectItem value="Requester">Requester</SelectItem>
                <SelectItem value="Document Creator">Document Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">SLA Days</label>
            <Input 
              placeholder="SLA Days" 
              value={newUser.slaDays}
              onChange={(e) => setNewUser({...newUser, slaDays: e.target.value})}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Country</label>
            <Select value={newUser.country} onValueChange={(value) => setNewUser({...newUser, country: value})}>
              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                {filteredCountries.length === 0 ? (
                  <SelectItem value="no-countries-available" disabled>No countries available</SelectItem>
                ) : (
                  filteredCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Department</label>
            <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                {filteredDepartments.length === 0 ? (
                  <SelectItem value="no-departments-available" disabled>No departments available</SelectItem>
                ) : (
                  filteredDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-8">
          <Button onClick={handleAddUser} className="bg-[#ffa530] hover:bg-[#e6942b] px-8">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* User List - Full Width */}
      <div className="w-full bg-white dark:bg-gray-800 p-8 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between dark:text-white">
          <span className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Users ({filteredUsers.length})
          </span>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </h2>
        
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>SLA Days</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.country}</TableCell>
                  <TableCell>{user.employeeCode}</TableCell>
                  <TableCell>{user.slaDays}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.active !== false}
                      onCheckedChange={() => handleToggleUserStatus(user)}
                      disabled={!!editingUser}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(user.id)}
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Employee Code</label>
                <Input
                  value={editingUser.employeeCode}
                  onChange={(e) => setEditingUser({...editingUser, employeeCode: e.target.value})}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Document Controller">Document Controller</SelectItem>
                    <SelectItem value="Document Owner">Document Owner</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Requester">Requester</SelectItem>
                    <SelectItem value="Document Creator">Document Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">SLA Days</label>
                <Input
                  value={editingUser.slaDays}
                  onChange={(e) => setEditingUser({...editingUser, slaDays: e.target.value})}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Country</label>
                <Select value={editingUser.country} onValueChange={(value) => setEditingUser({...editingUser, country: value})}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {filteredCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Department</label>
                <Select value={editingUser.department} onValueChange={(value) => setEditingUser({...editingUser, department: value})}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {filteredDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setEditingUser(null)}
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-[#ffa530] hover:bg-[#e6942b]">
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;
