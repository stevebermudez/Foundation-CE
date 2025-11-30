import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/home";
import CoursesPage from "@/pages/courses";
import DashboardPage from "@/pages/dashboard";
import CompliancePage from "@/pages/compliance";
import ResourcesPage from "@/pages/resources";
import CourseViewPage from "@/pages/course-view";
import NotFound from "@/pages/not-found";

function Router({ selectedState, onStateChange }: { selectedState: "CA" | "FL"; onStateChange: (state: "CA" | "FL") => void }) {
  return (
    <Switch>
      <Route path="/">
        <HomePage selectedState={selectedState} onStateChange={onStateChange} />
      </Route>
      <Route path="/courses">
        <CoursesPage selectedState={selectedState} />
      </Route>
      <Route path="/course/:id">
        <CourseViewPage />
      </Route>
      <Route path="/dashboard">
        <DashboardPage selectedState={selectedState} />
      </Route>
      <Route path="/compliance">
        <CompliancePage selectedState={selectedState} />
      </Route>
      <Route path="/resources">
        <ResourcesPage selectedState={selectedState} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [selectedState, setSelectedState] = useState<"CA" | "FL">("CA");
  const [location] = useLocation();
  
  const isFullWidthPage = location.startsWith("/course/");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header selectedState={selectedState} onStateChange={setSelectedState} />
      <main className="flex-1">
        <Router selectedState={selectedState} onStateChange={setSelectedState} />
      </main>
      {!isFullWidthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <AppLayout />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
