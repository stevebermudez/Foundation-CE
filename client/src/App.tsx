import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CoursesCAPage from "@/pages/courses-ca";
import CoursesFLPage from "@/pages/courses-fl";
import CourseViewPage from "@/pages/course-view";
import AccountSetupPage from "@/pages/account-setup";
import DashboardPage from "@/pages/dashboard";
import ComplianceMonitorPage from "@/pages/compliance-monitor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/courses/ca" component={CoursesCAPage} />
      <Route path="/courses/fl" component={CoursesFLPage} />
      <Route path="/course/:id" component={CourseViewPage} />
      <Route path="/account-setup" component={AccountSetupPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/compliance" component={ComplianceMonitorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
