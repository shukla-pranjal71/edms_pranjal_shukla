
import { departments } from '@/data/hardcodedData';

export interface Department {
  id: number;
  name: string;
  created_at: string;
  approverName?: string;
  approverEmail?: string;
}

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const departmentService = {
  // Get all departments
  async getAllDepartments(): Promise<Department[]> {
    await simulateDelay();
    console.log('Returning hardcoded departments:', departments);
    return [...departments];
  },
  
  // Create a new department
  async createDepartment(name: string, approverName?: string, approverEmail?: string): Promise<Department | null> {
    await simulateDelay();
    
    const newDepartment: Department = {
      id: Math.max(...departments.map(d => d.id)) + 1,
      name: name.trim(),
      created_at: new Date().toISOString(),
      ...(approverName?.trim() && { approverName: approverName.trim() }),
      ...(approverEmail?.trim() && { approverEmail: approverEmail.trim() })
    };
    
    departments.push(newDepartment);
    console.log('Created new department:', newDepartment);
    return newDepartment;
  },
  
  // Update a department
  async updateDepartment(id: number, name: string, approverName?: string, approverEmail?: string): Promise<Department | null> {
    await simulateDelay();
    
    const departmentIndex = departments.findIndex(d => d.id === id);
    if (departmentIndex !== -1) {
      const updatedDepartment: Department = {
        ...departments[departmentIndex],
        name: name.trim(),
        ...(approverName?.trim() ? { approverName: approverName.trim() } : { approverName: undefined }),
        ...(approverEmail?.trim() ? { approverEmail: approverEmail.trim() } : { approverEmail: undefined })
      };
      departments[departmentIndex] = updatedDepartment;
      console.log('Updated department:', departments[departmentIndex]);
      return departments[departmentIndex];
    }
    return null;
  },
  
  // Delete a department
  async deleteDepartment(id: number): Promise<void> {
    await simulateDelay();
    
    const departmentIndex = departments.findIndex(d => d.id === id);
    if (departmentIndex !== -1) {
      const deletedDepartment = departments.splice(departmentIndex, 1)[0];
      console.log('Deleted department:', deletedDepartment);
    }
  }
};
