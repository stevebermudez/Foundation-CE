import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CoursesSelectPage from "@/pages/courses-select";
import CoursesCAPage from "@/pages/courses-ca";
import CoursesFLPage from "@/pages/courses-fl";
import CourseViewPage from "@/pages/course-view";
import AccountSetupPage from "@/pages/account-setup";
import DashboardPage from "@/pages/dashboard";
import CompliancePage from "@/pages/compliance";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/courses" component={CoursesSelectPage} />
          <Route path="/courses/ca" component={CoursesCAPage} />
          <Route path="/courses/fl" component={CoursesFLPage} />
          <Route path="/course/:id" component={CourseViewPage} />
          <Route path="/account-setup" component={AccountSetupPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/compliance" component={() => <CompliancePage />} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
