import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ComplianceItem {
  id: string;
  companyId: string;
  licenseType: string;
  requiredHours: number;
  hoursCompleted: number;
  renewalDueDate: string;
  expirationDate: string;
  isCompliant: number;
  completedDate: string | null;
  renewalCycle: number;
  notes?: string;
  company?: {
    name: string;
    state: string;
  };
}

export function ComplianceMonitor() {
  const { data: expiringCompliance, isLoading } = useQuery<ComplianceItem[]>({
    queryKey: ["/api/compliance/expiring/90"],
  });

  const getStatus = (item: ComplianceItem) => {
    if (item.isCompliant === 1) return "compliant";
    const daysUntilExpiry = differenceInDays(
      new Date(item.expirationDate),
      new Date()
    );
    if (daysUntilExpiry <= 0) return "expired";
    if (daysUntilExpiry <= 30) return "critical";
    return "warning";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-orange-100 text-orange-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="w-4 h-4" />;
      case "expired":
        return <AlertCircle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "warning":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading compliance data...</div>;
  }

  if (!expiringCompliance || expiringCompliance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Compliance Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No compliance items to monitor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Compliance Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expiringCompliance.map((item) => {
              const status = getStatus(item);
              const daysRemaining = differenceInDays(
                new Date(item.expirationDate),
                new Date()
              );
              const progressPercent =
                (item.hoursCompleted / item.requiredHours) * 100;

              return (
                <Card key={item.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {item.company?.name || "Company"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.licenseType.toUpperCase()} • {item.company?.state}
                          </p>
                        </div>
                        <Badge className={getStatusColor(status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            {status.toUpperCase()}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hours Completed</span>
                          <span className="font-medium">
                            {item.hoursCompleted}/{item.requiredHours}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Renewal Due</p>
                          <p className="font-medium">
                            {format(new Date(item.renewalDueDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Days Remaining</p>
                          <p
                            className={`font-medium ${
                              daysRemaining <= 0
                                ? "text-red-600"
                                : daysRemaining <= 30
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            {daysRemaining <= 0
                              ? "EXPIRED"
                              : `${daysRemaining} days`}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <p className="text-gray-700">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
