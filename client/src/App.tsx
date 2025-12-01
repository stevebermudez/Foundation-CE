import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CoursesFLPage from "@/pages/courses-fl";
import CourseViewPage from "@/pages/course-view";
import AccountSetupPage from "@/pages/account-setup";
import DashboardPage from "@/pages/dashboard";
import CompliancePage from "@/pages/compliance";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/courses/fl" component={CoursesFLPage} />
          <Route path="/course/:id" component={CourseViewPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
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
