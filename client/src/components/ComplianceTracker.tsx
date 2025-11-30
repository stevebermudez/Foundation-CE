import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

interface ComplianceTrackerProps {
  selectedState: "CA" | "FL";
}

// todo: remove mock functionality
const mockRequirements = {
  CA: {
    agency: "California Department of Real Estate (DRE)",
    licenseNumber: "02123456",
    renewalDate: "December 31, 2025",
    totalRequired: 45,
    completed: 3,
    categories: [
      { name: "Ethics", required: 3, completed: 3, status: "completed" },
      { name: "Fair Housing", required: 3, completed: 0, status: "pending" },
      { name: "Agency", required: 3, completed: 0, status: "pending" },
      { name: "Trust Fund Handling", required: 3, completed: 0, status: "pending" },
      { name: "Risk Management", required: 3, completed: 0, status: "pending" },
      { name: "Electives", required: 30, completed: 0, status: "pending" },
    ],
  },
  FL: {
    agency: "Florida Real Estate Commission (FREC)",
    licenseNumber: "BK3456789",
    renewalDate: "March 31, 2026",
    totalRequired: 14,
    completed: 0,
    categories: [
      { name: "Core Law", required: 3, completed: 0, status: "pending" },
      { name: "Ethics", required: 3, completed: 0, status: "pending" },
      { name: "Electives", required: 8, completed: 0, status: "pending" },
    ],
  },
};

const mockReportingHistory = [
  {
    id: "1",
    date: "Nov 15, 2025",
    course: "California Real Estate Ethics",
    ceHours: 3,
    status: "reported",
    confirmationNumber: "DRE-2025-89012",
  },
  {
    id: "2",
    date: "Oct 28, 2025",
    course: "Fair Housing Update",
    ceHours: 3,
    status: "pending",
    confirmationNumber: null,
  },
];

export default function ComplianceTracker({ selectedState }: ComplianceTrackerProps) {
  const requirements = mockRequirements[selectedState];
  const progress = (requirements.completed / requirements.totalRequired) * 100;

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

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Compliance Tracker</h1>
          <p className="text-muted-foreground">
            Monitor your CE requirements and {selectedState === "CA" ? "DRE" : "FREC"} reporting status.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{requirements.agency}</CardTitle>
                  <p className="text-sm text-muted-foreground">License #{requirements.licenseNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{requirements.completed}</p>
                  <p className="text-sm text-muted-foreground">Hours Completed</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold">{requirements.totalRequired - requirements.completed}</p>
                  <p className="text-sm text-muted-foreground">Hours Remaining</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold">{requirements.renewalDate}</p>
                  <p className="text-sm text-muted-foreground">Renewal Deadline</p>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {requirements.completed}/{requirements.totalRequired} CE Hours
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
                    You need to complete {requirements.totalRequired - requirements.completed} more CE hours before{" "}
                    {requirements.renewalDate} to maintain your license.
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
                {requirements.categories.map((category, index) => (
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
                          <Button variant="outline" size="sm" data-testid={`button-find-courses-${category.name.toLowerCase().replace(" ", "-")}`}>
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
                {selectedState === "CA" ? "DRE" : "FREC"} Reporting Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Auto-Reporting Enabled</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your completed courses are automatically reported to the {selectedState === "CA" ? "DRE" : "FREC"}.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Recent Submissions</h4>
                  {mockReportingHistory.length > 0 ? (
                    <div className="space-y-3">
                      {mockReportingHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{item.course}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.date} • {item.ceHours} CE Hours
                            </p>
                            {item.confirmationNumber && (
                              <p className="text-xs text-muted-foreground">
                                Confirmation: {item.confirmationNumber}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reporting history yet
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
                  <TableHead>Action</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>CE Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReportingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>Course Completion</TableCell>
                    <TableCell className="max-w-xs truncate">{item.course}</TableCell>
                    <TableCell>{item.ceHours}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
