import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminCoursesPage from "./courses";
import PagesManagerPage from "./pages-manager";
import ContentBuilderPage from "./content-builder";
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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => {
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
        <Tabs defaultValue="overview">
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-create-course">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-view-reports">
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
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                    <span className="font-medium">Database Connection</span>
                    <Badge className="bg-green-600">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                    <span className="font-medium">API Server</span>
                    <Badge className="bg-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                    <span className="font-medium">Payment Gateway</span>
                    <Badge className="bg-green-600">Connected</Badge>
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
                  <Button size="sm" data-testid="button-add-user">Add User</Button>
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
                      {users.slice(0, 5).map((user: any, idx: number) => (
                        <tr key={user.id || idx} className="border-b hover:bg-muted/50" data-testid={`user-row-${idx}`}>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.firstName} {user.lastName}</td>
                          <td className="p-2">0</td>
                          <td className="p-2"><Badge>Active</Badge></td>
                          <td className="p-2"><Button size="sm" variant="outline">Edit</Button></td>
                        </tr>
                      ))}
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
                <CardTitle>Enrollment Overrides</CardTitle>
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
                      {enrollments.slice(0, 5).map((enr: any, idx: number) => (
                        <tr key={enr.id || idx} className="border-b hover:bg-muted/50" data-testid={`enrollment-row-${idx}`}>
                          <td className="p-2">User {idx + 1}</td>
                          <td className="p-2">Course {idx + 1}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${Math.random() * 100}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-2"><Badge variant="secondary">In Progress</Badge></td>
                          <td className="p-2"><Button size="sm" variant="outline">Override</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card data-testid="card-admin-settings">
              <CardHeader>
                <CardTitle>Administration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">System Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">Manage platform-wide settings and configurations</p>
                  <Button variant="outline" data-testid="button-system-settings">Configure Settings</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Email Templates</h3>
                  <p className="text-sm text-muted-foreground mb-4">Customize email communications</p>
                  <Button variant="outline" data-testid="button-email-templates">Manage Templates</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">User Roles</h3>
                  <p className="text-sm text-muted-foreground mb-4">Configure user permissions and roles</p>
                  <Button variant="outline" data-testid="button-user-roles">Manage Roles</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
