import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Calendar,
  FileText,
  BarChart3,
} from "lucide-react";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  loading?: boolean;
}

function StatCard({ title, value, description, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate transition-all">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="outline" className="justify-start h-auto py-3" asChild>
          <Link href="/admin/courses">
            <BookOpen className="h-4 w-4 mr-3 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Manage Courses</div>
              <div className="text-xs text-muted-foreground">Add, edit, or remove courses</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </Button>
        <Button variant="outline" className="justify-start h-auto py-3" asChild>
          <Link href="/admin/content">
            <FileText className="h-4 w-4 mr-3 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Content Builder</div>
              <div className="text-xs text-muted-foreground">Edit lessons and quizzes</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </Button>
        <Button variant="outline" className="justify-start h-auto py-3" asChild>
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-3 text-purple-500" />
            <div className="text-left">
              <div className="font-medium">User Management</div>
              <div className="text-xs text-muted-foreground">View and manage students</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </Button>
        <Button variant="outline" className="justify-start h-auto py-3" asChild>
          <Link href="/admin/analytics">
            <BarChart3 className="h-4 w-4 mr-3 text-orange-500" />
            <div className="text-left">
              <div className="font-medium">View Analytics</div>
              <div className="text-xs text-muted-foreground">Performance reports</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentEnrollments({ enrollments, users, courses, loading }: { 
  enrollments: any[]; 
  users: any[]; 
  courses: any[];
  loading: boolean;
}) {
  const getUser = (userId: string) => users.find((u: any) => u.id === userId);
  const getCourse = (courseId: string) => courses.find((c: any) => c.id === courseId);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.enrolledAt || b.createdAt).getTime() - new Date(a.enrolledAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Recent Enrollments</CardTitle>
          <CardDescription>Latest student course enrollments</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/enrollments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No enrollments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEnrollments.map((enrollment) => {
              const user = getUser(enrollment.userId);
              const course = getCourse(enrollment.courseId);
              const progress = enrollment.progress || 0;

              return (
                <div key={enrollment.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email || 'Unknown User'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {course?.title || 'Unknown Course'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 hidden sm:block">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                    <Badge variant={enrollment.completed ? "default" : "secondary"} className="text-xs">
                      {enrollment.completed ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Done</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> {progress}%</>
                      )}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SystemHealth({ healthStatus, loading }: { healthStatus: any; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const services = [
    { name: "Database", status: healthStatus?.database || "unknown" },
    { name: "Storage", status: healthStatus?.storage || "unknown" },
    { name: "Auth", status: healthStatus?.auth || "unknown" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="text-sm">{service.name}</span>
            <Badge 
              variant={service.status === "healthy" || service.status === "ok" ? "default" : "destructive"}
              className="text-xs"
            >
              {service.status === "healthy" || service.status === "ok" ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Healthy</>
              ) : service.status === "unknown" ? (
                <><Clock className="h-3 w-3 mr-1" /> Unknown</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" /> Issue</>
              )}
            </Badge>
          </div>
        ))}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last checked</span>
            <span>Just now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoursePerformance({ courses, enrollments, loading }: { courses: any[]; enrollments: any[]; loading: boolean }) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const courseStats = courses.slice(0, 5).map((course) => {
    const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
    const completedCount = courseEnrollments.filter((e) => e.completed).length;
    const completionRate = courseEnrollments.length > 0 
      ? Math.round((completedCount / courseEnrollments.length) * 100) 
      : 0;

    return {
      ...course,
      enrollmentCount: courseEnrollments.length,
      completionRate,
    };
  });

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Course Performance</CardTitle>
          <CardDescription>Enrollment and completion rates</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/courses">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {courseStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No courses yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courseStats.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollmentCount} enrolled
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {course.completionRate}% complete
                  </Badge>
                </div>
                <Progress value={course.completionRate} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data: users = [], isLoading: loadingUsers } = useQuery({
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

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
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

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
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

  const { data: healthStatus, isLoading: loadingHealth } = useQuery({
    queryKey: ["/api/admin/health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000,
  });

  const isLoading = loadingUsers || loadingCourses || loadingEnrollments;
  
  const completedEnrollments = enrollments.filter((e: any) => e.completed).length;
  const completionRate = enrollments.length > 0 
    ? Math.round((completedEnrollments / enrollments.length) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          description="Registered students"
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Active Courses"
          value={courses.length}
          description="Available for enrollment"
          icon={BookOpen}
          loading={isLoading}
        />
        <StatCard
          title="Enrollments"
          value={enrollments.length}
          description={`${completedEnrollments} completed`}
          icon={GraduationCap}
          loading={isLoading}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Overall course completion"
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentEnrollments 
          enrollments={enrollments} 
          users={users} 
          courses={courses}
          loading={isLoading}
        />
        <QuickActions />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CoursePerformance 
          courses={courses} 
          enrollments={enrollments}
          loading={isLoading}
        />
        <SystemHealth healthStatus={healthStatus} loading={loadingHealth} />
      </div>
    </div>
  );
}
