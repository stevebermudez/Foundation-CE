import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Mail,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Save,
  Users,
  Lock,
} from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  label: string | null;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string | null;
  isActive: number;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string | null;
  isSystem: number;
  createdAt: string;
  updatedAt: string;
}

interface Supervisor {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("system");

  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [settingCategory, setSettingCategory] = useState("general");
  const [settingLabel, setSettingLabel] = useState("");
  const [settingDescription, setSettingDescription] = useState("");

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateCategory, setTemplateCategory] = useState("transactional");
  const [templateVariables, setTemplateVariables] = useState("");

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState("");

  const { data: settings = [], isLoading: settingsLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/email-templates", { headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<UserRole[]>({
    queryKey: ["/api/admin/roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roles", { headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });

  const { data: supervisors = [] } = useQuery<Supervisor[]>({
    queryKey: ["/api/admin/supervisors"],
    queryFn: async () => {
      const res = await fetch("/api/admin/supervisors", { headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch supervisors");
      return res.json();
    },
  });

  const saveSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; category: string; label?: string; description?: string }) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setSettingDialogOpen(false);
      resetSettingForm();
      toast({ title: "Setting saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save setting", variant: "destructive" });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string; body: string; category: string; variables?: string }) => {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setTemplateDialogOpen(false);
      resetTemplateForm();
      toast({ title: "Template created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => {
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setTemplateDialogOpen(false);
      resetTemplateForm();
      toast({ title: "Template updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; permissions?: string }) => {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setRoleDialogOpen(false);
      resetRoleForm();
      toast({ title: "Role created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create role", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserRole> }) => {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setRoleDialogOpen(false);
      resetRoleForm();
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to delete role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete role", variant: "destructive" });
    },
  });

  function resetSettingForm() {
    setEditingSetting(null);
    setSettingKey("");
    setSettingValue("");
    setSettingCategory("general");
    setSettingLabel("");
    setSettingDescription("");
  }

  function resetTemplateForm() {
    setEditingTemplate(null);
    setTemplateName("");
    setTemplateSubject("");
    setTemplateBody("");
    setTemplateCategory("transactional");
    setTemplateVariables("");
  }

  function resetRoleForm() {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setRolePermissions("");
  }

  function openEditSetting(setting: SystemSetting) {
    setEditingSetting(setting);
    setSettingKey(setting.key);
    setSettingValue(setting.value);
    setSettingCategory(setting.category);
    setSettingLabel(setting.label || "");
    setSettingDescription(setting.description || "");
    setSettingDialogOpen(true);
  }

  function openEditTemplate(template: EmailTemplate) {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateCategory(template.category);
    setTemplateVariables(template.variables || "");
    setTemplateDialogOpen(true);
  }

  function openEditRole(role: UserRole) {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRolePermissions(role.permissions || "");
    setRoleDialogOpen(true);
  }

  function handleSaveSetting() {
    if (!settingKey || settingValue === "") {
      toast({ title: "Key and value are required", variant: "destructive" });
      return;
    }
    saveSettingMutation.mutate({
      key: settingKey,
      value: settingValue,
      category: settingCategory,
      label: settingLabel || undefined,
      description: settingDescription || undefined,
    });
  }

  function handleSaveTemplate() {
    if (!templateName || !templateSubject || !templateBody) {
      toast({ title: "Name, subject, and body are required", variant: "destructive" });
      return;
    }
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        data: {
          subject: templateSubject,
          body: templateBody,
          category: templateCategory,
          variables: templateVariables || undefined,
        },
      });
    } else {
      createTemplateMutation.mutate({
        name: templateName,
        subject: templateSubject,
        body: templateBody,
        category: templateCategory,
        variables: templateVariables || undefined,
      });
    }
  }

  function handleSaveRole() {
    if (!roleName) {
      toast({ title: "Role name is required", variant: "destructive" });
      return;
    }
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        data: {
          name: roleName,
          description: roleDescription || undefined,
          permissions: rolePermissions || undefined,
        },
      });
    } else {
      createRoleMutation.mutate({
        name: roleName,
        description: roleDescription || undefined,
        permissions: rolePermissions || undefined,
      });
    }
  }

  const settingsByCategory = settings.reduce((acc: Record<string, SystemSetting[]>, setting) => {
    const cat = setting.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage system configuration, email templates, and user roles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="system" data-testid="tab-system-settings">
            <Settings className="h-4 w-4 mr-2" />
            System Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-email-templates">
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-user-roles">
            <Shield className="h-4 w-4 mr-2" />
            User Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
              </div>
              <Button onClick={() => { resetSettingForm(); setSettingDialogOpen(true); }} data-testid="button-add-setting">
                <Plus className="h-4 w-4 mr-2" />
                Add Setting
              </Button>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <p>Loading settings...</p>
              ) : Object.keys(settingsByCategory).length === 0 ? (
                <p className="text-muted-foreground">No settings configured yet. Add your first setting.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(settingsByCategory).map(([category, catSettings]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold capitalize mb-3">{category}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {catSettings.map((setting) => (
                            <TableRow key={setting.id} data-testid={`setting-row-${setting.key}`}>
                              <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                              <TableCell className="max-w-xs truncate">{setting.value}</TableCell>
                              <TableCell>{setting.label || "-"}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => openEditSetting(setting)} data-testid={`button-edit-setting-${setting.key}`}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage email templates for system notifications</CardDescription>
              </div>
              <Button onClick={() => { resetTemplateForm(); setTemplateDialogOpen(true); }} data-testid="button-add-template">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <p>Loading templates...</p>
              ) : templates.length === 0 ? (
                <p className="text-muted-foreground">No templates created yet. Add your first email template.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} data-testid={`template-row-${template.name}`}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.isActive === 1 ? "default" : "outline"}>
                            {template.isActive === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditTemplate(template)} data-testid={`button-edit-template-${template.name}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this template?")) {
                                  deleteTemplateMutation.mutate(template.id);
                                }
                              }}
                              data-testid={`button-delete-template-${template.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>User Roles</CardTitle>
                  <CardDescription>Define roles and permissions for users</CardDescription>
                </div>
                <Button onClick={() => { resetRoleForm(); setRoleDialogOpen(true); }} data-testid="button-add-role">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <p>Loading roles...</p>
                ) : roles.length === 0 ? (
                  <p className="text-muted-foreground">No roles defined yet. Add your first role.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id} data-testid={`role-row-${role.name}`}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || "-"}</TableCell>
                          <TableCell>
                            {role.isSystem === 1 ? (
                              <Badge variant="secondary">
                                <Lock className="h-3 w-3 mr-1" />
                                System
                              </Badge>
                            ) : (
                              <Badge variant="outline">Custom</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditRole(role)}
                                disabled={role.isSystem === 1}
                                data-testid={`button-edit-role-${role.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={role.isSystem === 1}
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this role?")) {
                                    deleteRoleMutation.mutate(role.id);
                                  }
                                }}
                                data-testid={`button-delete-role-${role.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Administrators
                </CardTitle>
                <CardDescription>Users with admin access (managed via supervisors table)</CardDescription>
              </CardHeader>
              <CardContent>
                {supervisors.length === 0 ? (
                  <p className="text-muted-foreground">No administrators found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supervisors.map((sup) => (
                        <TableRow key={sup.id}>
                          <TableCell className="font-mono text-sm">{sup.userId}</TableCell>
                          <TableCell>
                            <Badge variant={sup.role === "admin" ? "default" : "secondary"}>{sup.role}</Badge>
                          </TableCell>
                          <TableCell>{new Date(sup.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSetting ? "Edit Setting" : "Add Setting"}</DialogTitle>
            <DialogDescription>Configure a system setting value</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="setting-key">Key</Label>
              <Input
                id="setting-key"
                value={settingKey}
                onChange={(e) => setSettingKey(e.target.value)}
                placeholder="e.g., site_name"
                disabled={!!editingSetting}
                data-testid="input-setting-key"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting-value">Value</Label>
              <Input
                id="setting-value"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                placeholder="Setting value"
                data-testid="input-setting-value"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting-category">Category</Label>
              <Select value={settingCategory} onValueChange={setSettingCategory}>
                <SelectTrigger id="setting-category" data-testid="select-setting-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting-label">Label (optional)</Label>
              <Input
                id="setting-label"
                value={settingLabel}
                onChange={(e) => setSettingLabel(e.target.value)}
                placeholder="Display label"
                data-testid="input-setting-label"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting-description">Description (optional)</Label>
              <Textarea
                id="setting-description"
                value={settingDescription}
                onChange={(e) => setSettingDescription(e.target.value)}
                placeholder="What this setting controls"
                data-testid="input-setting-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSetting} disabled={saveSettingMutation.isPending} data-testid="button-save-setting">
              <Save className="h-4 w-4 mr-2" />
              {saveSettingMutation.isPending ? "Saving..." : "Save Setting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Email Template" : "Add Email Template"}</DialogTitle>
            <DialogDescription>Configure email template content and variables</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., welcome_email"
                disabled={!!editingTemplate}
                data-testid="input-template-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="Email subject line"
                data-testid="input-template-subject"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="template-category" data-testid="select-template-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-variables">Variables (comma-separated)</Label>
              <Input
                id="template-variables"
                value={templateVariables}
                onChange={(e) => setTemplateVariables(e.target.value)}
                placeholder="e.g., {{first_name}}, {{course_name}}"
                data-testid="input-template-variables"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-body">Email Body (HTML)</Label>
              <Textarea
                id="template-body"
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                placeholder="Enter email HTML content..."
                className="min-h-[200px] font-mono text-sm"
                data-testid="input-template-body"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              data-testid="button-save-template"
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplateMutation.isPending || updateTemplateMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
            <DialogDescription>Define role name, description, and permissions</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., content_editor"
                data-testid="input-role-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Describe the role's purpose"
                data-testid="input-role-description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-permissions">Permissions (JSON)</Label>
              <Textarea
                id="role-permissions"
                value={rolePermissions}
                onChange={(e) => setRolePermissions(e.target.value)}
                placeholder='e.g., {"courses": ["read", "write"], "users": ["read"]}'
                className="font-mono text-sm"
                data-testid="input-role-permissions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveRole}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              data-testid="button-save-role"
            >
              <Save className="h-4 w-4 mr-2" />
              {createRoleMutation.isPending || updateRoleMutation.isPending ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
