import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

interface AnalyticsSummary {
  totalUsers: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  recentEvents: Array<{
    id: string;
    userId: string;
    eventType: string;
    courseId?: string;
    lessonId?: string;
    createdAt: string;
  }>;
  eventsByType: Array<{
    eventType: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/summary", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const eventTypeData = analytics?.eventsByType?.map(e => ({
    name: formatEventType(e.eventType),
    value: e.count,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="analytics-title">Learning Analytics</h1>
          <p className="text-muted-foreground">
            Track learner engagement and course performance
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Live updates every 30s
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          description="Registered learners"
          testId="stat-users"
        />
        <StatCard
          title="Enrollments"
          value={analytics?.totalEnrollments || 0}
          icon={BookOpen}
          description="Active course enrollments"
          testId="stat-enrollments"
        />
        <StatCard
          title="Completions"
          value={analytics?.completedEnrollments || 0}
          icon={GraduationCap}
          description="Courses completed"
          testId="stat-completions"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics?.completionRate || 0}%`}
          icon={TrendingUp}
          description="Overall success rate"
          testId="stat-completion-rate"
          showProgress
          progressValue={analytics?.completionRate || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Events by Type
            </CardTitle>
            <CardDescription>
              Distribution of learning events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventTypeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {eventTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No event data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest learning events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-start justify-between p-2 rounded-lg bg-muted/50"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <EventTypeIcon eventType={event.eventType} />
                        <div>
                          <p className="text-sm font-medium">
                            {formatEventType(event.eventType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            User: {event.userId.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(event.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No recent activity
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Event Volume by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventTypeData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No event data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  testId,
  showProgress,
  progressValue
}: { 
  title: string;
  value: number | string;
  icon: any;
  description: string;
  testId: string;
  showProgress?: boolean;
  progressValue?: number;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {showProgress && progressValue !== undefined && (
          <Progress value={progressValue} className="mt-2 h-1" />
        )}
      </CardContent>
    </Card>
  );
}

function EventTypeIcon({ eventType }: { eventType: string }) {
  const iconClass = "w-4 h-4 text-muted-foreground";
  switch (eventType) {
    case "lesson_start":
    case "lesson_complete":
      return <BookOpen className={iconClass} />;
    case "quiz_attempt":
    case "quiz_complete":
      return <GraduationCap className={iconClass} />;
    case "video_play":
      return <Clock className={iconClass} />;
    default:
      return <Activity className={iconClass} />;
  }
}

function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
