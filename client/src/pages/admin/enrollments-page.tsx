import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  MoreHorizontal,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Eye,
  Settings,
  RefreshCcw,
} from "lucide-react";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addEnrollmentDialogOpen, setAddEnrollmentDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { data: enrollments = [], isLoading } = useQuery({
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

  const { data: users = [] } = useQuery({
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

  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: { userId: string; courseId: string }) => {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create enrollment");
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
    },
  });

  const getUser = (userId: string) => users.find((u: any) => u.id === userId);
  const getCourse = (courseId: string) => courses.find((c: any) => c.id === courseId);

  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    const user = getUser(enrollment.userId);
    const course = getCourse(enrollment.courseId);
    
    const matchesSearch =
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && enrollment.completed) ||
      (statusFilter === "in-progress" && !enrollment.completed && (enrollment.progress || 0) > 0) ||
      (statusFilter === "not-started" && !enrollment.completed && (enrollment.progress || 0) === 0);

    return matchesSearch && matchesStatus;
  });

  const completedCount = enrollments.filter((e: any) => e.completed).length;
  const inProgressCount = enrollments.filter((e: any) => !e.completed && (e.progress || 0) > 0).length;
  const notStartedCount = enrollments.filter((e: any) => !e.completed && (e.progress || 0) === 0).length;

  const handleCreateEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedCourseId) {
      toast({ title: "Error", description: "Please select a user and course", variant: "destructive" });
      return;
    }
    createEnrollmentMutation.mutate({ userId: selectedUserId, courseId: selectedCourseId });
  };

  const getStatusBadge = (enrollment: any) => {
    if (enrollment.completed) {
      return <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
    }
    const progress = enrollment.progress || 0;
    if (progress > 0) {
      return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
    }
    return <Badge variant="outline" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> Not Started</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enrollments</h2>
          <p className="text-muted-foreground">
            Manage student course enrollments and progress
          </p>
        </div>
        <Button onClick={() => setAddEnrollmentDialogOpen(true)} data-testid="button-add-enrollment">
          <Plus className="h-4 w-4 mr-2" />
          Add Enrollment
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("completed")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("in-progress")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("not-started")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notStartedCount}</p>
                <p className="text-sm text-muted-foreground">Not Started</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Enrollments</CardTitle>
              <CardDescription>
                {filteredEnrollments.length} of {enrollments.length} enrollments
                {statusFilter !== "all" && ` (${statusFilter.replace("-", " ")})`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search enrollments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-enrollments"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                </SelectContent>
              </Select>
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
          ) : filteredEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No enrollments found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first enrollment to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="hidden md:table-cell">Progress</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment: any) => {
                    const user = getUser(enrollment.userId);
                    const course = getCourse(enrollment.courseId);
                    const progress = enrollment.progress || 0;

                    return (
                      <TableRow key={enrollment.id} data-testid={`row-enrollment-${enrollment.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user?.firstName && user?.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user?.email || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-medium truncate">{course?.title || "Unknown Course"}</p>
                            <p className="text-xs text-muted-foreground">
                              {course?.hoursRequired} hours
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 w-32">
                            <Progress value={progress} className="h-2" />
                            <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getStatusBadge(enrollment)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-enrollment-menu-${enrollment.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Reset Progress
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addEnrollmentDialogOpen} onOpenChange={setAddEnrollmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Enrollment</DialogTitle>
            <DialogDescription>
              Enroll a student in a course. They'll gain immediate access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEnrollment} className="space-y-4">
            <div className="space-y-2">
              <Label>Select User *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-enrollment-user">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Course *</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger data-testid="select-enrollment-course">
                  <SelectValue placeholder="Choose a course" />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddEnrollmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEnrollmentMutation.isPending} data-testid="button-create-enrollment">
                {createEnrollmentMutation.isPending ? "Creating..." : "Create Enrollment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
