import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Trash, Plus, Edit, Save, X, FileText } from 'lucide-react';
import { initialRoles, Role } from './RoleManagementTab';
type WorkflowStep = {
  id: string;
  activityLabel: string;
  roleLabel: string;
  actions: {
    approve: boolean;
  };
  enabled: boolean;
};
type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: Date;
};
const defaultWorkflowSteps: WorkflowStep[] = [{
  id: '1',
  activityLabel: 'Level1 Approval',
  roleLabel: 'Reviewer',
  actions: {
    approve: true
  },
  enabled: true
}, {
  id: '2',
  activityLabel: 'Level2 Approval',
  roleLabel: 'Reviewer',
  actions: {
    approve: true
  },
  enabled: true
}, {
  id: '3',
  activityLabel: 'Final Approval',
  roleLabel: 'Document Controller',
  actions: {
    approve: true
  },
  enabled: true
}];
const initialWorkflows: Workflow[] = [{
  id: 'workflow-1',
  name: 'Standard Document Approval',
  description: 'Default workflow for document approval process',
  steps: [...defaultWorkflowSteps],
  enabled: true,
  createdAt: new Date()
}];
const translations = {
  en: {
    workflowConfiguration: "Workflow Configuration",
    configureApprovalProcess: "Create and manage approval workflows for documents.",
    back: "Back",
    save: "Save Workflow",
    activityLabel: "Activity Label",
    roleLabel: "Role Label",
    approve: "Approve",
    enabled: "Enabled",
    actions: "Actions",
    addStep: "Add Step",
    delete: "Delete",
    selectRole: "Select Role",
    createNewWorkflow: "Create New Workflow",
    workflowName: "Workflow Name",
    workflowDescription: "Description",
    editWorkflow: "Edit Workflow",
    deleteWorkflow: "Delete Workflow",
    workflowSteps: "Workflow Steps",
    noWorkflows: "No workflows created yet",
    createFirstWorkflow: "Create your first workflow",
    cancel: "Cancel"
  },
  ar: {
    workflowConfiguration: "تكوين سير العمل",
    configureApprovalProcess: "إنشاء وإدارة تدفقات الموافقة على المستندات.",
    back: "رجوع",
    save: "حفظ سير العمل",
    activityLabel: "تسمية النشاط",
    roleLabel: "تسمية الدور",
    approve: "موافقة",
    enabled: "مفعل",
    actions: "إجراءات",
    addStep: "أضف خطوة",
    delete: "حذف",
    selectRole: "اختر الدور",
    createNewWorkflow: "إنشاء سير عمل جديد",
    workflowName: "اسم سير العمل",
    workflowDescription: "الوصف",
    editWorkflow: "تحرير سير العمل",
    deleteWorkflow: "حذف سير العمل",
    workflowSteps: "خطوات سير العمل",
    noWorkflows: "لم يتم إنشاء أي سير عمل بعد",
    createFirstWorkflow: "أنشئ سير العمل الأول",
    cancel: "إلغاء"
  }
};
const WorkflowConfigurationTab = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [roles] = useState<Role[]>(initialRoles);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLang(event.detail.lang);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, [lang]);
  const t = translations[lang as keyof typeof translations] || translations.en;
  const handleCreateNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: 'New Workflow',
      description: 'Description for the new workflow',
      steps: [...defaultWorkflowSteps.map(step => ({
        ...step,
        id: uuidv4()
      }))],
      enabled: true,
      createdAt: new Date()
    };
    setSelectedWorkflow(newWorkflow);
    setIsCreating(true);
    setIsEditing(true);
  };
  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow({
      ...workflow
    });
    setIsEditing(true);
  };
  const handleSaveWorkflow = () => {
    if (!selectedWorkflow) return;
    if (isCreating) {
      setWorkflows(prev => [...prev, selectedWorkflow]);
      setIsCreating(false);
    } else {
      setWorkflows(prev => prev.map(wf => wf.id === selectedWorkflow.id ? selectedWorkflow : wf));
    }
    setIsEditing(false);
    setSelectedWorkflow(null);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedWorkflow(null);
  };
  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  };
  const handleWorkflowChange = (field: string, value: any) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow(prev => ({
      ...prev!,
      [field]: value
    }));
  };
  const handleStepChange = (stepId: string, field: string, value: any) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow(prev => ({
      ...prev!,
      steps: prev!.steps.map(step => {
        if (step.id !== stepId) return step;
        if (field.startsWith('actions.')) {
          const actionKey = field.split('.')[1] as keyof WorkflowStep['actions'];
          return {
            ...step,
            actions: {
              ...step.actions,
              [actionKey]: value
            }
          };
        }
        return {
          ...step,
          [field]: value
        };
      })
    }));
  };
  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    const newStep: WorkflowStep = {
      id: uuidv4(),
      activityLabel: 'New Step',
      roleLabel: roles[0]?.name || '',
      actions: {
        approve: true
      },
      enabled: true
    };
    setSelectedWorkflow(prev => ({
      ...prev!,
      steps: [...prev!.steps, newStep]
    }));
  };
  const handleDeleteStep = (stepId: string) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow(prev => ({
      ...prev!,
      steps: prev!.steps.filter(step => step.id !== stepId)
    }));
  };

  // Main workflows list view
  if (!selectedWorkflow) {
    return <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t.workflowConfiguration}</CardTitle>
              <CardDescription>{t.configureApprovalProcess}</CardDescription>
            </div>
            <Button onClick={handleCreateNewWorkflow} className="bg-[#117bbc] text-slate-50">
              <Plus className="mr-2 h-4 w-4" />
              {t.createNewWorkflow}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noWorkflows}</h3>
              <p className="text-gray-500 mb-4">{t.createFirstWorkflow}</p>
              <Button onClick={handleCreateNewWorkflow}>
                <Plus className="mr-2 h-4 w-4" />
                {t.createNewWorkflow}
              </Button>
            </div> : <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead>{t.workflowName}</TableHead>
                    <TableHead>{t.workflowDescription}</TableHead>
                    <TableHead className="w-[100px]">{t.enabled}</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map(workflow => <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell className="text-gray-600">{workflow.description}</TableCell>
                      <TableCell>
                        <Switch checked={workflow.enabled} onCheckedChange={checked => {
                    setWorkflows(prev => prev.map(wf => wf.id === workflow.id ? {
                      ...wf,
                      enabled: checked
                    } : wf));
                  }} className="bg-[#117bbc]" />
                      </TableCell>
                      <TableCell>{workflow.steps.length} steps</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditWorkflow(workflow)} aria-label={t.editWorkflow}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkflow(workflow.id)} aria-label={t.deleteWorkflow}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>;
  }

  // Workflow editing view
  return <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{isCreating ? t.createNewWorkflow : t.editWorkflow}</CardTitle>
            <CardDescription>{t.configureApprovalProcess}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              {t.cancel}
            </Button>
            <Button onClick={handleSaveWorkflow}>
              <Save className="mr-2 h-4 w-4" />
              {t.save}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Workflow metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.workflowName}</label>
              <Input value={selectedWorkflow.name} onChange={e => handleWorkflowChange('name', e.target.value)} placeholder="Enter workflow name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.workflowDescription}</label>
              <Input value={selectedWorkflow.description} onChange={e => handleWorkflowChange('description', e.target.value)} placeholder="Enter workflow description" />
            </div>
          </div>

          {/* Workflow steps */}
          <div>
            <h3 className="text-lg font-medium mb-4">{t.workflowSteps}</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-[100px]">{t.enabled}</TableHead>
                    <TableHead>{t.activityLabel}</TableHead>
                    <TableHead>{t.roleLabel}</TableHead>
                    <TableHead>{t.approve}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedWorkflow.steps.map(step => <TableRow key={step.id} data-state={step.enabled ? '' : 'disabled'} className="data-[state=disabled]:opacity-50">
                      <TableCell>
                        <Switch checked={step.enabled} onCheckedChange={checked => handleStepChange(step.id, 'enabled', checked)} />
                      </TableCell>
                      <TableCell>
                        <Input value={step.activityLabel} onChange={e => handleStepChange(step.id, 'activityLabel', e.target.value)} className="min-w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Select value={step.roleLabel} onValueChange={value => handleStepChange(step.id, 'roleLabel', value)}>
                          <SelectTrigger className="min-w-[200px]">
                            <SelectValue placeholder={t.selectRole} />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Switch checked={step.actions.approve} onCheckedChange={checked => handleStepChange(step.id, 'actions.approve', checked)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStep(step.id)} aria-label={t.delete}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleAddStep}>
                <Plus className="mr-2 h-4 w-4" />
                {t.addStep}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default WorkflowConfigurationTab;