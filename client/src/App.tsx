import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SkipLinks } from "@/components/SkipLinks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import CoursesFLPage from "@/pages/courses-fl";
import CourseViewPage from "@/pages/course-view";
import CheckoutPage from "@/pages/checkout";
import CheckoutSuccessPage from "@/pages/checkout-success";
import CheckoutCancelPage from "@/pages/checkout-cancel";
import AccountSetupPage from "@/pages/account-setup";
import DashboardPage from "@/pages/dashboard";
import CompliancePage from "@/pages/compliance";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminIndexPage from "@/pages/admin/index";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminContentBuilderPage from "@/pages/admin/content-builder";
import AdminPagesManagerPage from "@/pages/admin/pages-manager";
import AdminFinancePage from "@/pages/admin/finance";
import AdminSettingsPage from "@/pages/admin/settings";
import CourseLearningPage from "@/pages/course-learning";
import UnitLearningPage from "@/pages/unit-learning";
import AccessibilityPage from "@/pages/accessibility";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import LegalCompliancePage from "@/pages/legal-compliance";
import AffiliateProgramPage from "@/pages/affiliate-program";
import CookieConsent from "@/components/CookieConsent";
import CMSPage from "@/components/CMSPage";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipLinks />
      <ScrollToTop />
      <a id="main-navigation" className="sr-only focus:not-sr-only" tabIndex={-1}>Navigation</a>
      <Header />
      <main id="main-content" className="flex-1" role="main" aria-label="Main content">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/courses/fl" component={CoursesFLPage} />
          <Route path="/course/:id" component={CourseViewPage} />
          <Route path="/course/:id/learn" component={CourseLearningPage} />
          <Route path="/course/:courseId/unit/:unitId" component={UnitLearningPage} />
          <Route path="/checkout/success" component={CheckoutSuccessPage} />
          <Route path="/checkout/cancel" component={CheckoutCancelPage} />
          <Route path="/checkout/:courseId" component={CheckoutPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/account-setup" component={AccountSetupPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/compliance" component={() => <CompliancePage selectedState="FL" />} />
          <Route path="/accessibility" component={AccessibilityPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/privacy" component={PrivacyPolicyPage} />
          <Route path="/legal-compliance" component={LegalCompliancePage} />
          <Route path="/security" component={LegalCompliancePage} />
          <Route path="/affiliates" component={AffiliateProgramPage} />
          <Route path="/affiliate-program" component={AffiliateProgramPage} />
          <Route path="/admin" component={AdminIndexPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route path="/admin/courses" component={AdminCoursesPage} />
          <Route path="/admin/content-builder">{() => <AdminContentBuilderPage />}</Route>
          <Route path="/admin/pages-manager" component={AdminPagesManagerPage} />
          <Route path="/admin/pages" component={AdminPagesManagerPage} />
          <Route path="/admin/finance" component={AdminFinancePage} />
          <Route path="/admin/settings" component={AdminSettingsPage} />
          <Route path="/checkout"><CheckoutPage /></Route>
          <Route path="/:slug">{(params) => <CMSPage slug={params.slug} />}</Route>
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
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
