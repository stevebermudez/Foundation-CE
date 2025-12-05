import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Send,
  AlertTriangle,
  Shield,
  Building,
  Download,
  Home,
  Umbrella,
  Landmark,
  ExternalLink,
  Zap,
  Plus,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserLicense, Enrollment, Course, DBPRReport, SirconReport } from "@shared/schema";

interface ComplianceTrackerProps {
  selectedState: "CA" | "FL";
}

interface ComplianceSummary {
  licenses: UserLicense[];
  enrollments: (Enrollment & { course: Course })[];
  hoursCompleted: Record<string, number>;
  reportingHistory: (DBPRReport | SirconReport & { reportType: string; agency: string })[];
}

const LICENSE_TYPES = {
  FL: [
    { value: "sales_associate", label: "Sales Associate", agency: "FREC", hoursRequired: 14 },
    { value: "broker", label: "Broker", agency: "FREC", hoursRequired: 14 },
    { value: "insurance_agent", label: "Insurance Agent", agency: "OIR", hoursRequired: 24 },
  ],
  CA: [
    { value: "salesperson", label: "Real Estate Salesperson", agency: "DRE", hoursRequired: 45 },
    { value: "broker", label: "Real Estate Broker", agency: "DRE", hoursRequired: 45 },
    { value: "insurance_agent", label: "Insurance Agent", agency: "CDI", hoursRequired: 24 },
    { value: "mortgage_loan_originator", label: "Mortgage Loan Originator", agency: "DFPI", hoursRequired: 8 },
  ],
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ComplianceTracker({ selectedState }: ComplianceTrackerProps) {
  const { toast } = useToast();
  const [addLicenseOpen, setAddLicenseOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    licenseNumber: "",
    licenseType: "",
    issueDate: "",
    expirationDate: "",
  });

  const { data: complianceData, isLoading, error } = useQuery<ComplianceSummary>({
    queryKey: ["/api/compliance/summary", selectedState],
    queryFn: async () => {
      const response = await fetch(`/api/compliance/summary?state=${selectedState}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch compliance data");
      return response.json();
    },
  });

  const handleAddLicense = async () => {
    if (!newLicense.licenseNumber || !newLicense.licenseType || !newLicense.issueDate || !newLicense.expirationDate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      await apiRequest("POST", "/api/compliance/licenses", {
        licenseNumber: newLicense.licenseNumber,
        licenseType: newLicense.licenseType,
        state: selectedState,
        issueDate: newLicense.issueDate,
        expirationDate: newLicense.expirationDate,
        renewalDueDate: newLicense.expirationDate,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/compliance/summary", selectedState] });
      setAddLicenseOpen(false);
      setNewLicense({ licenseNumber: "", licenseType: "", issueDate: "", expirationDate: "" });
      toast({ title: "Success", description: "License added successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add license", variant: "destructive" });
    }
  };

  const getAgencyIcon = (licenseType: string) => {
    if (licenseType.includes("insurance")) return Umbrella;
    if (licenseType.includes("mortgage")) return Landmark;
    return Home;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "accepted":
      case "submitted":
        return <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Complete</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
      case "reported":
        return <Badge className="bg-green-600 gap-1"><Send className="h-3 w-3" /> Reported</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Circle className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const getReportingMethodBadge = (reportType: string) => {
    if (reportType === "Sircon") {
      return (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Zap className="h-3 w-3" />
          Sircon
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Send className="h-3 w-3" />
        DBPR
      </Badge>
    );
  };

  const getLicenseTypeInfo = (licenseType: string) => {
    const types = LICENSE_TYPES[selectedState] || [];
    return types.find(t => t.value === licenseType) || { label: licenseType, agency: "Unknown", hoursRequired: 0 };
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4">
        <div className="mx-auto max-w-6xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Compliance Data</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your compliance tracker.</p>
            <Link href="/login">
              <Button data-testid="button-login-compliance">Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const licenses = complianceData?.licenses || [];
  const enrollments = complianceData?.enrollments || [];
  const reportingHistory = complianceData?.reportingHistory || [];

  if (licenses.length === 0) {
    return (
      <div className="py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Compliance Tracker</h1>
            <p className="text-muted-foreground">
              Monitor your CE requirements and reporting status across all your {selectedState === "CA" ? "California" : "Florida"} licenses.
            </p>
          </div>

          <Card className="p-8 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Licenses Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your {selectedState === "CA" ? "California" : "Florida"} professional license to start tracking your CE requirements and compliance status.
            </p>

            <Dialog open={addLicenseOpen} onOpenChange={setAddLicenseOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" data-testid="button-add-first-license">
                  <Plus className="h-5 w-5" />
                  Add Your First License
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add License</DialogTitle>
                  <DialogDescription>
                    Enter your {selectedState === "CA" ? "California" : "Florida"} professional license information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="licenseType">License Type</Label>
                    <Select
                      value={newLicense.licenseType}
                      onValueChange={(value) => setNewLicense({ ...newLicense, licenseType: value })}
                    >
                      <SelectTrigger data-testid="select-license-type">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_TYPES[selectedState]?.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({type.agency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={newLicense.licenseNumber}
                      onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                      placeholder="e.g., BK3456789"
                      data-testid="input-license-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={newLicense.issueDate}
                        onChange={(e) => setNewLicense({ ...newLicense, issueDate: e.target.value })}
                        data-testid="input-issue-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        value={newLicense.expirationDate}
                        onChange={(e) => setNewLicense({ ...newLicense, expirationDate: e.target.value })}
                        data-testid="input-expiration-date"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddLicense} className="w-full" data-testid="button-save-license">
                    Add License
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Complete courses to earn CE hours that will automatically be tracked here.
              </p>
              <Link href={`/courses/${selectedState.toLowerCase()}`}>
                <Button variant="outline" data-testid="button-browse-courses-empty">
                  Browse Available Courses
                </Button>
              </Link>
            </div>
          </Card>

          {enrollments.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Completed Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You have {enrollments.length} completed course{enrollments.length !== 1 ? "s" : ""}. 
                  Add your license above to track these hours toward your CE requirements.
                </p>
                <div className="space-y-2">
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{enrollment.course.title}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.hoursCompleted} CE hours</p>
                      </div>
                      <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Complete</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Compliance Tracker</h1>
            <p className="text-muted-foreground">
              Monitor your CE requirements and reporting status across all your {selectedState === "CA" ? "California" : "Florida"} licenses.
            </p>
          </div>
          <Dialog open={addLicenseOpen} onOpenChange={setAddLicenseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-add-license">
                <Plus className="h-4 w-4" />
                Add License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add License</DialogTitle>
                <DialogDescription>
                  Enter your {selectedState === "CA" ? "California" : "Florida"} professional license information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select
                    value={newLicense.licenseType}
                    onValueChange={(value) => setNewLicense({ ...newLicense, licenseType: value })}
                  >
                    <SelectTrigger data-testid="select-license-type-modal">
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_TYPES[selectedState]?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.agency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={newLicense.licenseNumber}
                    onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                    placeholder="e.g., BK3456789"
                    data-testid="input-license-number-modal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={newLicense.issueDate}
                      onChange={(e) => setNewLicense({ ...newLicense, issueDate: e.target.value })}
                      data-testid="input-issue-date-modal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={newLicense.expirationDate}
                      onChange={(e) => setNewLicense({ ...newLicense, expirationDate: e.target.value })}
                      data-testid="input-expiration-date-modal"
                    />
                  </div>
                </div>
                <Button onClick={handleAddLicense} className="w-full" data-testid="button-save-license-modal">
                  Add License
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue={licenses[0]?.id || "overview"}>
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            {licenses.map((license) => {
              const typeInfo = getLicenseTypeInfo(license.licenseType);
              const Icon = getAgencyIcon(license.licenseType);
              return (
                <TabsTrigger
                  key={license.id}
                  value={license.id}
                  className="gap-2"
                  data-testid={`tab-license-${license.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {typeInfo.agency}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {licenses.map((license) => {
            const typeInfo = getLicenseTypeInfo(license.licenseType);
            const Icon = getAgencyIcon(license.licenseType);
            const hoursCompleted = complianceData?.hoursCompleted[license.licenseType] || 0;
            const totalRequired = typeInfo.hoursRequired;
            const progress = Math.min((hoursCompleted / totalRequired) * 100, 100);
            const hoursRemaining = Math.max(totalRequired - hoursCompleted, 0);

            const licenseReports = reportingHistory.filter(
              (r: any) => r.licenseType?.toLowerCase().includes(license.licenseType.toLowerCase().split("_")[0])
            );

            return (
              <TabsContent key={license.id} value={license.id}>
                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{typeInfo.label}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">License #{license.licenseNumber}</p>
                            <Badge variant="secondary" className="text-xs">{typeInfo.agency}</Badge>
                            <Badge variant={license.status === "active" ? "default" : "destructive"} className="text-xs">
                              {license.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3 mb-6">
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary" data-testid="text-hours-completed">{hoursCompleted}</p>
                          <p className="text-sm text-muted-foreground">Hours Completed</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-3xl font-bold" data-testid="text-hours-remaining">{hoursRemaining}</p>
                          <p className="text-sm text-muted-foreground">Hours Remaining</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-lg font-bold" data-testid="text-renewal-date">{formatDate(license.expirationDate)}</p>
                          <p className="text-sm text-muted-foreground">Renewal Deadline</p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {hoursCompleted}/{totalRequired} CE Hours
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </CardContent>
                  </Card>

                  <Card className={hoursRemaining > 0 ? "border-amber-200 dark:border-amber-900" : "border-green-200 dark:border-green-900"}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {hoursRemaining > 0 ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                Action Required
                              </h4>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                                Complete {hoursRemaining} more CE hours before{" "}
                                {formatDate(license.expirationDate)} to maintain your {typeInfo.agency} license.
                              </p>
                              <Link href={`/courses/${selectedState.toLowerCase()}`}>
                                <Button size="sm" data-testid="button-browse-courses">
                                  Browse Courses
                                </Button>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                Requirements Met
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                                You have completed all required CE hours for this license renewal cycle.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Completed Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {enrollments.length > 0 ? (
                        <div className="space-y-3">
                          {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{enrollment.course.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(enrollment.completedAt)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">|</span>
                                  <span className="text-xs text-muted-foreground">
                                    {enrollment.hoursCompleted || enrollment.course.hoursRequired} CE hours
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" /> Complete
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-4">No completed courses yet</p>
                          <Link href={`/courses/${selectedState.toLowerCase()}`}>
                            <Button variant="outline" size="sm" data-testid="button-start-learning">
                              Start Learning
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Reporting Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-200">
                              Auto-Reporting Enabled
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Your completed courses are automatically reported to the {typeInfo.agency}.
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Recent Submissions</h4>
                          </div>
                          {licenseReports.length > 0 ? (
                            <div className="space-y-3">
                              {licenseReports.slice(0, 3).map((report: any) => (
                                <div
                                  key={report.id}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{report.courseTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground">{formatDate(report.completionDate)}</span>
                                      <span className="text-xs text-muted-foreground">|</span>
                                      <span className="text-xs text-muted-foreground">{report.ceHours} CE</span>
                                      {getReportingMethodBadge(report.reportType)}
                                    </div>
                                    {report.confirmationNumber && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {report.confirmationNumber}
                                      </p>
                                    )}
                                  </div>
                                  {getStatusBadge(report.status)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No reporting history yet. Complete a course to see submissions here.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Compliance Audit Trail</CardTitle>
                      <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-audit">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>CE Hours</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenseReports.map((report: any) => (
                          <TableRow key={report.id}>
                            <TableCell>{formatDate(report.completionDate)}</TableCell>
                            <TableCell className="max-w-xs truncate">{report.courseTitle}</TableCell>
                            <TableCell>{report.ceHours}</TableCell>
                            <TableCell>{getReportingMethodBadge(report.reportType)}</TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                          </TableRow>
                        ))}
                        {licenseReports.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No audit history yet. Complete courses to build your compliance record.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
