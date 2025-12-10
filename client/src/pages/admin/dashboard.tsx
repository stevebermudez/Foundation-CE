import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminCoursesPage from "./courses";
import PagesManagerPage from "./pages-manager";
import ContentBuilderPage from "./content-builder";
import AdminFinancePage from "./finance";
import AdminSettingsPage from "./settings";
import AnalyticsDashboard from "./analytics-dashboard";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setLocation("/admin/login");
          return;
        }

        const res = await fetch("/api/auth/is-admin", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setLocation("/admin/login");
          return;
        }
        const data = await res.json();
        if (!data.isAdmin) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setLocation("/admin/login");
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        console.error("Error checking admin status:", err);
        localStorage.removeItem("adminToken");
        setLocation("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [setLocation]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/admin/enrollments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/enrollments", {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  // Health check for system status
  const { data: healthStatus } = useQuery({
    queryKey: ["/api/admin/health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health", {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Progress override state
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [detailedProgress, setDetailedProgress] = useState<any>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Add User dialog state
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Edit User dialog state
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserFirstName, setEditUserFirstName] = useState("");
  const [editUserLastName, setEditUserLastName] = useState("");

  // Add Enrollment dialog state
  const [addEnrollmentDialogOpen, setAddEnrollmentDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Fetch detailed progress for an enrollment
  const fetchDetailedProgress = async (enrollmentId: string) => {
    setLoadingProgress(true);
    setExpandedUnits({}); // Reset expanded units
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/detailed-progress`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      setDetailedProgress(data);
      // Auto-expand the first unit to show lessons immediately
      if (data.units && data.units.length > 0) {
        setExpandedUnits({ [data.units[0].unit.id]: true });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load progress details", variant: "destructive" });
    } finally {
      setLoadingProgress(false);
    }
  };

  // Open progress dialog
  const openProgressDialog = async (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setProgressDialogOpen(true);
    await fetchDetailedProgress(enrollment.id);
  };

  // Complete all lessons in a unit
  const completeUnitMutation = useMutation({
    mutationFn: async ({ enrollmentId, unitId }: { enrollmentId: string; unitId: string }) => {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/units/${unitId}/complete-all`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to complete unit');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      if (selectedEnrollment) fetchDetailedProgress(selectedEnrollment.id);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete unit", variant: "destructive" });
    }
  });

  // Override unit progress
  const overrideUnitProgressMutation = useMutation({
    mutationFn: async ({ progressId, data }: { progressId: string; data: any }) => {
      const res = await fetch(`/api/admin/unit-progress/${progressId}/data`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update unit progress');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      if (selectedEnrollment) fetchDetailedProgress(selectedEnrollment.id);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update unit progress", variant: "destructive" });
    }
  });

  // Override lesson progress
  const overrideLessonProgressMutation = useMutation({
    mutationFn: async ({ progressId, data }: { progressId: string; data: any }) => {
      const res = await fetch(`/api/admin/lesson-progress/${progressId}/data`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update lesson progress');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      if (selectedEnrollment) fetchDetailedProgress(selectedEnrollment.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lesson progress", variant: "destructive" });
    }
  });

  // Create lesson progress (for lessons with no progress record)
  const createLessonProgressMutation = useMutation({
    mutationFn: async ({ enrollmentId, lessonId, userId }: { enrollmentId: string; lessonId: string; userId: string }) => {
      const res = await fetch(`/api/admin/lesson-progress`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enrollmentId, lessonId, userId, completed: true }),
      });
      if (!res.ok) throw new Error('Failed to create lesson progress');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      if (selectedEnrollment) fetchDetailedProgress(selectedEnrollment.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark lesson complete", variant: "destructive" });
    }
  });

  // Toggle unit expansion
  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; firstName: string; lastName: string; password: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setAddUserDialogOpen(false);
      setNewUserEmail("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserPassword("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { userId: string; email: string; firstName: string; lastName: string }) => {
      const res = await fetch(`/api/admin/users/${userData.userId}/data`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserDialogOpen(false);
      setEditingUser(null);
      setEditUserEmail("");
      setEditUserFirstName("");
      setEditUserLastName("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create enrollment mutation
  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: { userId: string; courseId: string }) => {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create enrollment');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Enrollment created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      setAddEnrollmentDialogOpen(false);
      setSelectedUserId("");
      setSelectedCourseId("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Handle create user form submit
  const handleCreateUser = () => {
    if (!newUserEmail) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    createUserMutation.mutate({
      email: newUserEmail,
      firstName: newUserFirstName,
      lastName: newUserLastName,
      password: newUserPassword
    });
  };

  // Open edit user dialog
  const openEditUserDialog = (user: any) => {
    setEditingUser(user);
    setEditUserEmail(user.email || "");
    setEditUserFirstName(user.firstName || "");
    setEditUserLastName(user.lastName || "");
    setEditUserDialogOpen(true);
  };

  // Handle update user form submit
  const handleUpdateUser = () => {
    if (!editingUser || !editUserEmail) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({
      userId: editingUser.id,
      email: editUserEmail,
      firstName: editUserFirstName,
      lastName: editUserLastName,
    });
  };

  // Handle create enrollment form submit
  const handleCreateEnrollment = () => {
    if (!selectedUserId || !selectedCourseId) {
      toast({ title: "Error", description: "Please select a user and course", variant: "destructive" });
      return;
    }
    createEnrollmentMutation.mutate({
      userId: selectedUserId,
      courseId: selectedCourseId
    });
  };

  // Get user info for display
  const getUserDisplay = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim() : `User ${userId.slice(0, 8)}...`;
  };

  // Get course info for display
  const getCourseDisplay = (courseId: string) => {
    const course = courses.find((c: any) => c.id === courseId);
    return course ? course.title : `Course ${courseId.slice(0, 8)}...`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-12 border-b bg-card">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-8">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    await fetch("/api/logout", { credentials: 'include' });
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-xs text-muted-foreground">Platform Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card data-testid="card-total-users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-courses">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-enrollments">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-completion-rate">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrollments.length > 0
                      ? Math.round(
                          (enrollments.filter((e: any) => e.completed).length /
                            enrollments.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" data-testid="tab-admin-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-admin-courses">
              Courses
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-admin-users">
              Users
            </TabsTrigger>
            <TabsTrigger value="enrollments" data-testid="tab-admin-enrollments">
              Enrollments
            </TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-admin-content">
              Content Builder
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-admin-pages">
              Website Pages
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-admin-settings">
              Settings
            </TabsTrigger>
            <TabsTrigger value="finance" data-testid="tab-admin-finance">
              Finance
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-admin-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    data-testid="button-create-course"
                    onClick={() => setActiveTab("courses")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    data-testid="button-manage-users"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    data-testid="button-sync-courses"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("adminToken");
                        const res = await fetch("/api/admin/seed-courses", {
                          method: "POST",
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                          credentials: 'include',
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert(`Courses synced! Total: ${data.totalCourses} courses`);
                          window.location.reload();
                        } else {
                          alert("Failed to sync courses");
                        }
                      } catch (err) {
                        alert("Error syncing courses");
                      }
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Sync Course Catalog
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    data-testid="button-view-reports"
                    onClick={() => setActiveTab("enrollments")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    healthStatus?.database?.status === 'healthy' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                      : healthStatus?.database?.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900'
                  }`}>
                    <span className="font-medium">Database Connection</span>
                    <Badge className={
                      healthStatus?.database?.status === 'healthy' ? 'bg-green-600' :
                      healthStatus?.database?.status === 'error' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }>
                      {healthStatus?.database?.status === 'healthy' ? 'Healthy' :
                       healthStatus?.database?.status === 'error' ? 'Error' : 'Checking...'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    healthStatus?.api?.status === 'healthy' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900'
                  }`}>
                    <span className="font-medium">API Server</span>
                    <Badge className={healthStatus?.api?.status === 'healthy' ? 'bg-green-600' : 'bg-yellow-600'}>
                      {healthStatus?.api?.status === 'healthy' ? 'Running' : 'Checking...'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    healthStatus?.payment?.status === 'healthy' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                      : healthStatus?.payment?.status === 'not_configured'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900'
                      : healthStatus?.payment?.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-900'
                  }`}>
                    <span className="font-medium">Payment Gateway</span>
                    <Badge className={
                      healthStatus?.payment?.status === 'healthy' ? 'bg-green-600' :
                      healthStatus?.payment?.status === 'not_configured' ? 'bg-yellow-600' :
                      healthStatus?.payment?.status === 'error' ? 'bg-red-600' :
                      'bg-gray-600'
                    }>
                      {healthStatus?.payment?.status === 'healthy' ? 'Connected' :
                       healthStatus?.payment?.status === 'not_configured' ? 'Not Configured' :
                       healthStatus?.payment?.status === 'error' ? 'Error' : 'Checking...'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card data-testid="card-users-list">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Button size="sm" onClick={() => setAddUserDialogOpen(true)} data-testid="button-add-user">Add User</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Enrollments</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-muted-foreground">
                            No users found. Click "Add User" to create one.
                          </td>
                        </tr>
                      ) : (
                        users.map((user: any, idx: number) => {
                          const userEnrollments = enrollments.filter((e: any) => e.userId === user.id);
                          return (
                            <tr key={user.id || idx} className="border-b hover:bg-muted/50" data-testid={`user-row-${idx}`}>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2">{user.firstName || ''} {user.lastName || ''}</td>
                              <td className="p-2">{userEnrollments.length}</td>
                              <td className="p-2">
                                {user.passwordHash || user.googleId ? (
                                  <Badge className="bg-green-600">Active</Badge>
                                ) : (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                              </td>
                              <td className="p-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => openEditUserDialog(user)}
                                  data-testid={`button-edit-user-${idx}`}
                                >
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <AdminCoursesPage />
          </TabsContent>

          {/* Content Builder Tab */}
          <TabsContent value="content">
            <ContentBuilderPage />
          </TabsContent>

          {/* Website Pages Tab */}
          <TabsContent value="pages">
            <PagesManagerPage />
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card data-testid="card-enrollments-list">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enrollment Progress Management</CardTitle>
                  <Button size="sm" onClick={() => setAddEnrollmentDialogOpen(true)} data-testid="button-add-enrollment">Add Enrollment</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Course</th>
                        <th className="text-left p-2">Progress</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-muted-foreground">
                            No enrollments found
                          </td>
                        </tr>
                      ) : (
                        enrollments.map((enr: any, idx: number) => (
                          <tr key={enr.id || idx} className="border-b hover:bg-muted/50" data-testid={`enrollment-row-${enr.id}`}>
                            <td className="p-2">{getUserDisplay(enr.userId)}</td>
                            <td className="p-2">{getCourseDisplay(enr.courseId)}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-600" 
                                    style={{ width: `${Math.round((enr.hoursCompleted / (enr.hoursRequired || 63)) * 100)}%` }} 
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {enr.hoursCompleted || 0}h / {enr.hoursRequired || 63}h
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              {enr.completed ? (
                                <Badge className="bg-green-600">Completed</Badge>
                              ) : (
                                <Badge variant="secondary">In Progress</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => openProgressDialog(enr)}
                                data-testid={`button-override-${enr.id}`}
                              >
                                Manage Progress
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Progress Override Dialog */}
            <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage Course Progress</DialogTitle>
                  <DialogDescription>
                    {selectedEnrollment && (
                      <>
                        <span className="font-medium">{getUserDisplay(selectedEnrollment.userId)}</span>
                        <span className="mx-2">-</span>
                        <span>{getCourseDisplay(selectedEnrollment.courseId)}</span>
                      </>
                    )}
                    <span className="block mt-1 text-xs">Click on a unit to expand and view lessons</span>
                  </DialogDescription>
                </DialogHeader>

                {loadingProgress ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading progress...</p>
                  </div>
                ) : detailedProgress ? (
                  <div className="space-y-3">
                    {detailedProgress.units.map((unitData: any) => (
                      <div key={unitData.unit.id} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover-elevate"
                          onClick={() => toggleUnitExpansion(unitData.unit.id)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedUnits[unitData.unit.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              Unit {unitData.unit.unitNumber}: {unitData.unit.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {unitData.progress?.status === "completed" ? (
                              <Badge className="bg-green-600">Completed</Badge>
                            ) : unitData.progress?.status === "in_progress" ? (
                              <Badge variant="secondary">In Progress</Badge>
                            ) : (
                              <Badge variant="outline">Locked</Badge>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                completeUnitMutation.mutate({
                                  enrollmentId: selectedEnrollment.id,
                                  unitId: unitData.unit.id
                                });
                              }}
                              disabled={completeUnitMutation.isPending}
                              data-testid={`button-complete-unit-${unitData.unit.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Complete Unit
                            </Button>
                          </div>
                        </div>

                        {expandedUnits[unitData.unit.id] && (
                          <div className="p-3 space-y-2">
                            {unitData.progress && (
                              <div className="flex items-center gap-4 p-2 bg-muted/30 rounded text-sm mb-3">
                                <span>Lessons: {unitData.lessons.filter((l: any) => l.progress?.completed).length}/{unitData.lessons.length}</span>
                                <span>Quiz: {unitData.progress.quizPassed ? 'Passed' : 'Not Passed'}</span>
                                <span>Score: {unitData.progress.quizScore || 0}%</span>
                                {unitData.progress.status !== "completed" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => overrideUnitProgressMutation.mutate({
                                      progressId: unitData.progress.id,
                                      data: { status: "completed", quizPassed: true, quizScore: 100 }
                                    })}
                                    data-testid={`button-mark-complete-${unitData.unit.id}`}
                                  >
                                    Mark Completed
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Lessons:</p>
                              {unitData.lessons.map((lessonData: any) => (
                                <div 
                                  key={lessonData.lesson.id}
                                  className="flex items-center justify-between p-2 bg-background rounded border"
                                >
                                  <span className="text-sm">
                                    {lessonData.lesson.lessonNumber}. {lessonData.lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {lessonData.progress?.completed ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <X className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {!lessonData.progress?.completed && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          if (lessonData.progress) {
                                            overrideLessonProgressMutation.mutate({
                                              progressId: lessonData.progress.id,
                                              data: { completed: true }
                                            });
                                          } else {
                                            createLessonProgressMutation.mutate({
                                              enrollmentId: selectedEnrollment!.id,
                                              lessonId: lessonData.lesson.id,
                                              userId: selectedEnrollment!.userId
                                            });
                                          }
                                        }}
                                        data-testid={`button-complete-lesson-${lessonData.lesson.id}`}
                                      >
                                        Complete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No progress data available</p>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setProgressDialogOpen(false)} data-testid="button-close-progress-dialog">
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AdminSettingsPage />
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance">
            <AdminFinancePage />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Password is optional - users can login with Google OAuth.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  data-testid="input-user-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={newUserFirstName}
                    onChange={(e) => setNewUserFirstName(e.target.value)}
                    data-testid="input-user-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={newUserLastName}
                    onChange={(e) => setNewUserLastName(e.target.value)}
                    data-testid="input-user-lastname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Leave blank for OAuth-only login"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  data-testid="input-user-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)} data-testid="button-cancel-add-user">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser} 
                disabled={createUserMutation.isPending}
                data-testid="button-confirm-add-user"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Enrollment Dialog */}
        <Dialog open={addEnrollmentDialogOpen} onOpenChange={setAddEnrollmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Enrollment</DialogTitle>
              <DialogDescription>
                Enroll a user in a course. Select the user and course below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">Select User *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-enrollment-user">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-select">Select Course *</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger data-testid="select-enrollment-course">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddEnrollmentDialogOpen(false)} data-testid="button-cancel-add-enrollment">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateEnrollment} 
                disabled={createEnrollmentMutation.isPending || !selectedUserId || !selectedCourseId}
                data-testid="button-confirm-add-enrollment"
              >
                {createEnrollmentMutation.isPending ? "Creating..." : "Create Enrollment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="user@example.com"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  data-testid="input-edit-user-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    placeholder="John"
                    value={editUserFirstName}
                    onChange={(e) => setEditUserFirstName(e.target.value)}
                    data-testid="input-edit-user-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    placeholder="Doe"
                    value={editUserLastName}
                    onChange={(e) => setEditUserLastName(e.target.value)}
                    data-testid="input-edit-user-lastname"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserDialogOpen(false)} data-testid="button-cancel-edit-user">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser} 
                disabled={updateUserMutation.isPending}
                data-testid="button-confirm-edit-user"
              >
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
