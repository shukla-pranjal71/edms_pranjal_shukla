
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const ReviewerManagementTab = () => {
  // Start with empty reviewers array - all data will come from user input
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [newReviewer, setNewReviewer] = useState({ name: '', email: '', department: '', specialization: '' });
  const { toast } = useToast();

  const handleAddReviewer = () => {
    if (!newReviewer.name || !newReviewer.email) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const reviewer = {
      id: reviewers.length + 1,
      ...newReviewer
    };

    setReviewers([...reviewers, reviewer]);
    setNewReviewer({ name: '', email: '', department: '', specialization: '' });
    
    toast({
      title: "Reviewer Added",
      description: `${reviewer.name} has been added as a reviewer`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Reviewer
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input 
              placeholder="Full Name" 
              value={newReviewer.name}
              onChange={(e) => setNewReviewer({...newReviewer, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={newReviewer.email}
              onChange={(e) => setNewReviewer({...newReviewer, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input 
              placeholder="Department" 
              value={newReviewer.department}
              onChange={(e) => setNewReviewer({...newReviewer, department: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <Input 
              placeholder="Area of Expertise" 
              value={newReviewer.specialization}
              onChange={(e) => setNewReviewer({...newReviewer, specialization: e.target.value})}
            />
          </div>
        </div>
        
        <Button className="mt-4" onClick={handleAddReviewer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reviewer
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Reviewer List</h2>
        
        {reviewers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviewers added yet. Add reviewers using the form above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewers.map((reviewer) => (
                <TableRow key={reviewer.id}>
                  <TableCell>{reviewer.id}</TableCell>
                  <TableCell>{reviewer.name}</TableCell>
                  <TableCell>{reviewer.email}</TableCell>
                  <TableCell>{reviewer.department}</TableCell>
                  <TableCell>{reviewer.specialization}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ReviewerManagementTab;
