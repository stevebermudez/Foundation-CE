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
} from "lucide-react";
import { type StateCode, getAgenciesByState, REGULATORY_AGENCIES } from "@/lib/stateRegulators";
import { ZIRCON_CONFIG } from "@/lib/zirconIntegration";

interface ComplianceTrackerProps {
  selectedState: StateCode;
}

// todo: remove mock functionality
const mockLicenses = {
  CA: [
    {
      agency: REGULATORY_AGENCIES.CA_DRE,
      licenseNumber: "02123456",
      renewalDate: "December 31, 2025",
      totalRequired: 45,
      completed: 3,
      status: "active",
      categories: [
        { name: "Ethics", required: 3, completed: 3, status: "completed" },
        { name: "Fair Housing", required: 3, completed: 0, status: "pending" },
        { name: "Agency", required: 3, completed: 0, status: "pending" },
        { name: "Trust Fund Handling", required: 3, completed: 0, status: "pending" },
        { name: "Risk Management", required: 3, completed: 0, status: "pending" },
        { name: "Electives", required: 30, completed: 0, status: "pending" },
      ],
    },
    {
      agency: REGULATORY_AGENCIES.CA_DOI,
      licenseNumber: "0A12345",
      renewalDate: "June 30, 2025",
      totalRequired: 24,
      completed: 8,
      status: "active",
      categories: [
        { name: "Ethics", required: 3, completed: 3, status: "completed" },
        { name: "Annuity Training", required: 4, completed: 4, status: "completed" },
        { name: "Laws & Regulations", required: 5, completed: 1, status: "in_progress" },
        { name: "Electives", required: 12, completed: 0, status: "pending" },
      ],
    },
    {
      agency: REGULATORY_AGENCIES.CA_DFPI,
      licenseNumber: "MLO123456",
      renewalDate: "December 31, 2025",
      totalRequired: 8,
      completed: 0,
      status: "active",
      categories: [
        { name: "Federal Law & Regulations", required: 3, completed: 0, status: "pending" },
        { name: "Ethics", required: 2, completed: 0, status: "pending" },
        { name: "Non-Traditional Lending", required: 2, completed: 0, status: "pending" },
        { name: "Electives", required: 1, completed: 0, status: "pending" },
      ],
    },
  ],
  FL: [
    {
      agency: REGULATORY_AGENCIES.FL_FREC,
      licenseNumber: "BK3456789",
      renewalDate: "March 31, 2026",
      totalRequired: 14,
      completed: 0,
      status: "active",
      categories: [
        { name: "Core Law", required: 3, completed: 0, status: "pending" },
        { name: "Ethics", required: 3, completed: 0, status: "pending" },
        { name: "Electives", required: 8, completed: 0, status: "pending" },
      ],
    },
    {
      agency: REGULATORY_AGENCIES.FL_OIR,
      licenseNumber: "W123456",
      renewalDate: "September 30, 2025",
      totalRequired: 24,
      completed: 5,
      status: "active",
      categories: [
        { name: "Ethics", required: 3, completed: 3, status: "completed" },
        { name: "Laws & Rules Update", required: 5, completed: 2, status: "in_progress" },
        { name: "Electives", required: 16, completed: 0, status: "pending" },
      ],
    },
  ],
};

const mockReportingHistory = [
  {
    id: "1",
    date: "Nov 15, 2025",
    course: "California Real Estate Ethics",
    ceHours: 3,
    agency: "DRE",
    status: "reported",
    confirmationNumber: "DRE-2025-89012",
    method: "auto",
  },
  {
    id: "2",
    date: "Nov 10, 2025",
    course: "Insurance Ethics Fundamentals",
    ceHours: 3,
    agency: "CDI",
    status: "reported",
    confirmationNumber: "ZRC-2025-45678",
    method: "zircon",
  },
  {
    id: "3",
    date: "Oct 28, 2025",
    course: "Annuity Products Training",
    ceHours: 4,
    agency: "CDI",
    status: "pending",
    confirmationNumber: null,
    method: "zircon",
  },
];

export default function ComplianceTracker({ selectedState }: ComplianceTrackerProps) {
  const licenses = mockLicenses[selectedState] || [];

  const getAgencyIcon = (profession: string) => {
    switch (profession) {
      case "real_estate":
        return Home;
      case "insurance":
        return Umbrella;
      case "mortgage":
        return Landmark;
      default:
        return Building;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Complete</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
      case "reported":
        return <Badge className="bg-green-600 gap-1"><Send className="h-3 w-3" /> Reported</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Circle className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const getReportingMethodBadge = (method: string) => {
    if (method === "zircon") {
      return (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Zap className="h-3 w-3" />
          Zircon
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Send className="h-3 w-3" />
        Auto
      </Badge>
    );
  };

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Compliance Tracker</h1>
          <p className="text-muted-foreground">
            Monitor your CE requirements and reporting status across all your {selectedState === "CA" ? "California" : "Florida"} licenses.
          </p>
        </div>

        <Tabs defaultValue={licenses[0]?.agency.id || "overview"}>
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            {licenses.map((license) => {
              const Icon = getAgencyIcon(license.agency.profession);
              return (
                <TabsTrigger
                  key={license.agency.id}
                  value={license.agency.id}
                  className="gap-2"
                  data-testid={`tab-${license.agency.abbreviation}`}
                >
                  <Icon className="h-4 w-4" />
                  {license.agency.abbreviation}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {licenses.map((license) => {
            const progress = (license.completed / license.totalRequired) * 100;
            const Icon = getAgencyIcon(license.agency.profession);

            return (
              <TabsContent key={license.agency.id} value={license.agency.id}>
                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{license.agency.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">License #{license.licenseNumber}</p>
                            <Badge variant="secondary" className="text-xs">{license.agency.abbreviation}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3 mb-6">
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-3xl font-bold text-primary">{license.completed}</p>
                          <p className="text-sm text-muted-foreground">Hours Completed</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-3xl font-bold">{license.totalRequired - license.completed}</p>
                          <p className="text-sm text-muted-foreground">Hours Remaining</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-lg font-bold">{license.renewalDate}</p>
                          <p className="text-sm text-muted-foreground">Renewal Deadline</p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {license.completed}/{license.totalRequired} CE Hours
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 dark:border-amber-900">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                            Action Required
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                            Complete {license.totalRequired - license.completed} more CE hours before{" "}
                            {license.renewalDate} to maintain your {license.agency.abbreviation} license.
                          </p>
                          <Button size="sm" data-testid="button-browse-courses">
                            Browse Courses
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Category Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" className="w-full">
                        {license.categories.map((category, index) => (
                          <AccordionItem key={index} value={`category-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span>{category.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">
                                    {category.completed}/{category.required} hours
                                  </span>
                                  {category.status === "completed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : category.status === "in_progress" ? (
                                    <Clock className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2">
                                <Progress
                                  value={(category.completed / category.required) * 100}
                                  className="h-2"
                                />
                                <p className="text-sm text-muted-foreground">
                                  {category.status === "completed"
                                    ? "You have fulfilled this requirement."
                                    : `Complete ${category.required - category.completed} more hours in this category.`}
                                </p>
                                {category.status !== "completed" && (
                                  <Button variant="outline" size="sm" data-testid={`button-find-courses-${category.name.toLowerCase().replace(/ /g, "-")}`}>
                                    Find {category.name} Courses
                                  </Button>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
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
                        {license.agency.reportingMethod === "zircon" ? (
                          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-800 dark:text-purple-200">
                                Zircon Integration Active
                              </span>
                            </div>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                              Your insurance CE completions are automatically reported via Zircon to {license.agency.abbreviation}.
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Provider: {ZIRCON_CONFIG.providerName}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800 dark:text-green-200">
                                Auto-Reporting Enabled
                              </span>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Your completed courses are automatically reported to the {license.agency.abbreviation}.
                            </p>
                          </div>
                        )}

                        <Separator />

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Recent Submissions</h4>
                            <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-submissions">
                              View All
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          {mockReportingHistory.filter(r => r.agency === license.agency.abbreviation).length > 0 ? (
                            <div className="space-y-3">
                              {mockReportingHistory
                                .filter(r => r.agency === license.agency.abbreviation)
                                .slice(0, 3)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{item.course}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">{item.date}</span>
                                        <span className="text-xs text-muted-foreground">|</span>
                                        <span className="text-xs text-muted-foreground">{item.ceHours} CE</span>
                                        {getReportingMethodBadge(item.method)}
                                      </div>
                                      {item.confirmationNumber && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {item.confirmationNumber}
                                        </p>
                                      )}
                                    </div>
                                    {getStatusBadge(item.status)}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No reporting history for this agency yet
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
                        {mockReportingHistory
                          .filter(r => r.agency === license.agency.abbreviation)
                          .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell className="max-w-xs truncate">{item.course}</TableCell>
                              <TableCell>{item.ceHours}</TableCell>
                              <TableCell>{getReportingMethodBadge(item.method)}</TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))}
                        {mockReportingHistory.filter(r => r.agency === license.agency.abbreviation).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No audit history for this agency
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
