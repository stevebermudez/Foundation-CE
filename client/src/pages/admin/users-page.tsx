import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  UserPlus,
  Filter,
  BookOpen,
  Clock,
  CheckCircle2,
  RotateCcw,
  Settings,
  Award,
} from "lucide-react";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  
  const [editUserForm, setEditUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  // View Enrollments state
  const [viewEnrollmentsDialogOpen, setViewEnrollmentsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [progressEditEnrollment, setProgressEditEnrollment] = useState<any>(null);
  const [newProgress, setNewProgress] = useState<number>(0);
  const [resetConfirmEnrollment, setResetConfirmEnrollment] = useState<any>(null);
  const [markCompleteEnrollment, setMarkCompleteEnrollment] = useState<any>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/admin/enrollments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/enrollments", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ enrollmentId, progress, completed, hoursCompleted }: { 
      enrollmentId: string; 
      progress?: number; 
      completed?: number;
      hoursCompleted?: number;
    }) => {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ progress, completed, hoursCompleted }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update progress");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Progress updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      setProgressEditEnrollment(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserForm) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setAddUserDialogOpen(false);
      setNewUserForm({ email: "", firstName: "", lastName: "", password: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, ...userData }: { userId: string } & typeof editUserForm) => {
      const res = await fetch(`/api/admin/users/${userId}/data`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const getUserEnrollmentCount = (userId: string) => {
    return enrollments.filter((e: any) => e.userId === userId).length;
  };

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter((e: any) => e.userId === userId);
  };

  const getCourseById = (courseId: string) => {
    return courses.find((c: any) => c.id === courseId);
  };

  const openViewEnrollments = (user: any) => {
    setSelectedUser(user);
    setViewEnrollmentsDialogOpen(true);
  };

  const handleUpdateProgress = (enrollment: any) => {
    setProgressEditEnrollment(enrollment);
    setNewProgress(enrollment.progress || 0);
  };

  const saveProgress = () => {
    if (progressEditEnrollment) {
      updateProgressMutation.mutate({
        enrollmentId: progressEditEnrollment.id,
        progress: newProgress,
      });
    }
  };

  const handleResetProgress = () => {
    if (resetConfirmEnrollment) {
      updateProgressMutation.mutate({
        enrollmentId: resetConfirmEnrollment.id,
        progress: 0,
        completed: 0,
        hoursCompleted: 0,
      });
      setResetConfirmEnrollment(null);
    }
  };

  const handleMarkComplete = () => {
    if (markCompleteEnrollment) {
      const course = getCourseById(markCompleteEnrollment.courseId);
      updateProgressMutation.mutate({
        enrollmentId: markCompleteEnrollment.id,
        progress: 100,
        completed: 1,
        hoursCompleted: course?.hoursRequired || 0,
      });
      setMarkCompleteEnrollment(null);
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditUserForm({
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
    setEditUserDialogOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUserForm);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUserForm.email) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({ userId: editingUser.id, ...editUserForm });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage student accounts and enrollments
          </p>
        </div>
        <Button onClick={() => setAddUserDialogOpen(true)} data-testid="button-add-user">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <GraduationCap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u: any) => getUserEnrollmentCount(u.id) > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">With Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Mail className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u: any) => u.emailVerified).length}
                </p>
                <p className="text-sm text-muted-foreground">Verified Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} of {users.length} users
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-users"
                />
              </div>
              <Button variant="outline" size="icon" data-testid="button-filter-users">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Add your first user to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Enrollments</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {getUserEnrollmentCount(user.id)} courses
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.emailVerified ? (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-user-menu-${user.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openViewEnrollments(user)} data-testid={`button-view-enrollments-${user.id}`}>
                              <GraduationCap className="h-4 w-4 mr-2" />
                              View Enrollments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new student account. They'll receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUserForm.firstName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  placeholder="John"
                  data-testid="input-new-user-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUserForm.lastName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  placeholder="Doe"
                  data-testid="input-new-user-lastname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="john@example.com"
                required
                data-testid="input-new-user-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                placeholder="Leave blank to auto-generate"
                data-testid="input-new-user-password"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending} data-testid="button-create-user">
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's account information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editUserForm.firstName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                  data-testid="input-edit-user-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                  data-testid="input-edit-user-lastname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                required
                data-testid="input-edit-user-email"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending} data-testid="button-update-user">
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Enrollments Dialog */}
      <Dialog open={viewEnrollmentsDialogOpen} onOpenChange={setViewEnrollmentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Enrollments for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedUser && getUserEnrollments(selectedUser.id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No enrollments found for this user.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedUser && getUserEnrollments(selectedUser.id).map((enrollment: any) => {
                  const course = getCourseById(enrollment.courseId);
                  return (
                    <Card key={enrollment.id} className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {course?.title || 'Unknown Course'}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course?.hoursRequired || 0} hours required
                            </p>
                          </div>
                          <Badge variant={enrollment.completed ? "default" : "secondary"}>
                            {enrollment.completed ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{enrollment.progress || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress || 0} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Hours Completed:</span>
                            <span className="ml-1 font-medium">{enrollment.hoursCompleted || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Enrolled:</span>
                            <span className="ml-1 font-medium">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                          {enrollment.expiresAt && (
                            <div>
                              <span className="text-muted-foreground">Expires:</span>
                              <span className="ml-1 font-medium">
                                {new Date(enrollment.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {enrollment.finalExamPassed ? (
                            <div>
                              <span className="text-muted-foreground">Final Exam:</span>
                              <span className="ml-1 font-medium text-green-600">
                                Passed ({enrollment.finalExamScore}%)
                              </span>
                            </div>
                          ) : enrollment.finalExamAttempts > 0 && (
                            <div>
                              <span className="text-muted-foreground">Final Exam:</span>
                              <span className="ml-1 font-medium text-yellow-600">
                                {enrollment.finalExamAttempts} attempt(s)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateProgress(enrollment)}
                            data-testid={`button-edit-progress-${enrollment.id}`}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Edit Progress
                          </Button>
                          {!enrollment.completed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setMarkCompleteEnrollment(enrollment)}
                              data-testid={`button-mark-complete-${enrollment.id}`}
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setResetConfirmEnrollment(enrollment)}
                            data-testid={`button-reset-progress-${enrollment.id}`}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset Progress
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEnrollmentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Progress Dialog */}
      <Dialog open={!!progressEditEnrollment} onOpenChange={() => setProgressEditEnrollment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Progress</DialogTitle>
            <DialogDescription>
              Manually adjust the student's progress for this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Progress: {newProgress}%</Label>
              <Slider
                value={[newProgress]}
                onValueChange={(value) => setNewProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressEditEnrollment(null)}>
              Cancel
            </Button>
            <Button 
              onClick={saveProgress} 
              disabled={updateProgressMutation.isPending}
              data-testid="button-save-progress"
            >
              {updateProgressMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Progress Confirmation */}
      <AlertDialog open={!!resetConfirmEnrollment} onOpenChange={() => setResetConfirmEnrollment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this student's progress? This will set their progress to 0%, 
              remove all completed hours, and mark the course as incomplete. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-reset"
            >
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Complete Confirmation */}
      <AlertDialog open={!!markCompleteEnrollment} onOpenChange={() => setMarkCompleteEnrollment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Course Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this course as complete? This will set progress to 100% 
              and credit all required hours. Use this for manual completions or transfers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkComplete}
              data-testid="button-confirm-complete"
            >
              Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
