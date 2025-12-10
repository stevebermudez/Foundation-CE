import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  BookOpen,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Scale,
  User,
  Info,
  Calendar,
  FileText,
} from "lucide-react";
import { REGULATORY_AGENCIES, type ExamPolicy } from "@/lib/stateRegulators";

interface Course {
  id: string;
  title: string;
  state: string;
  hoursRequired: number;
  expirationMonths: number;
  instructorName?: string;
  instructorEmail?: string;
  instructorPhone?: string;
  instructorAddress?: string;
  instructorAvailability?: string;
  courseOfferingNumber?: string;
  providerNumber?: string;
  deliveryMethod?: string;
}

interface CoursePolicyDisclosureProps {
  course: Course;
  enrollmentExpiresAt?: string;
  onAcknowledge?: () => void;
  isDialog?: boolean;
}

export function CoursePolicyDisclosure({
  course,
  enrollmentExpiresAt,
  onAcknowledge,
  isDialog = false,
}: CoursePolicyDisclosureProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [showDialog, setShowDialog] = useState(true);

  // Get Florida exam policy for Florida courses
  const getExamPolicy = (): ExamPolicy | undefined => {
    if (course.state === "FL") {
      return REGULATORY_AGENCIES.FL_FREC.examPolicy;
    }
    return undefined;
  };

  const examPolicy = getExamPolicy();
  const isFloridaCourse = course.state === "FL";

  const handleAcknowledge = () => {
    if (onAcknowledge) {
      onAcknowledge();
    }
    setShowDialog(false);
  };

  const content = (
    <div className="space-y-6">
      {/* Course Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Course Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              Course: {course.courseOfferingNumber || course.id.slice(0, 8).toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {course.hoursRequired} Hours Required
            </Badge>
          </div>
          {enrollmentExpiresAt && (
            <div className="flex items-center gap-2 col-span-full">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Expires: {new Date(enrollmentExpiresAt).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </div>
        {course.deliveryMethod && (
          <p className="text-sm text-muted-foreground">
            <strong>Delivery Method:</strong> {course.deliveryMethod}
          </p>
        )}
      </div>

      <Separator />

      {/* Florida-Specific Exam Requirements */}
      {isFloridaCourse && examPolicy && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Examination Requirements</h3>
              <Badge variant="secondary" className="text-xs">Per Rule 61J2-3.008(5)(a), F.A.C.</Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p>
                  A minimum passing score of <strong>{examPolicy.passingScore}%</strong> is required 
                  on the end-of-course examination.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p>
                  Students failing the examination must wait at least <strong>{examPolicy.retestWaitDays} days</strong> from 
                  the date of the original examination to retest.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p>
                  Within one year of the original examination, a student may retest a maximum 
                  of <strong>{examPolicy.maxRetestsPerYear} time(s)</strong>.
                </p>
              </div>
              {examPolicy.requiresCourseRepeatAfterMaxRetests && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Students failing the end-of-course examination after retesting must 
                    <strong> repeat the course</strong> prior to being eligible to take the examination again.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Hour Equivalency */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Course Hour Equivalency</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {examPolicy.hourEquivalency}
            </p>
          </div>

          <Separator />
        </>
      )}

      {/* Instructor Access Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Instructor Access</h3>
          {isFloridaCourse && (
            <Badge variant="secondary" className="text-xs">Per Rule 61J2-3.008(5)(b), F.A.C.</Badge>
          )}
        </div>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 space-y-2 text-sm">
            {course.instructorName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{course.instructorName}</span>
              </div>
            )}
            {course.instructorEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${course.instructorEmail}`} 
                  className="text-primary hover:underline"
                  data-testid="link-instructor-email"
                >
                  {course.instructorEmail}
                </a>
              </div>
            )}
            {course.instructorPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${course.instructorPhone}`} 
                  className="text-primary hover:underline"
                  data-testid="link-instructor-phone"
                >
                  {course.instructorPhone}
                </a>
              </div>
            )}
            {course.instructorAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="whitespace-pre-line">{course.instructorAddress}</span>
              </div>
            )}
            {course.instructorAvailability && (
              <div className="flex items-start gap-2 mt-2 pt-2 border-t">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Availability Hours:</span>
                  <p className="text-muted-foreground">{course.instructorAvailability}</p>
                </div>
              </div>
            )}
            {!course.instructorName && !course.instructorEmail && (
              <p className="text-muted-foreground italic">
                Instructor information: support@foundationce.com
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notice of Course Completion */}
      {isFloridaCourse && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Completion & Reporting</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Upon satisfactory completion, Foundation CE issues a notice of course completion 
              in compliance with Rule 61J2-3.015, F.A.C. Course completions are reported to DBPR 
              in accordance with applicable reporting requirements.
            </p>
          </div>
        </>
      )}
    </div>
  );

  if (isDialog) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Course Standards & Requirements
            </DialogTitle>
            <DialogDescription>
              Please review the following information before beginning your course.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {content}
          </ScrollArea>
          <div className="flex items-center gap-2 pt-4 border-t">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              data-testid="checkbox-acknowledge-policy"
            />
            <label htmlFor="acknowledge" className="text-sm cursor-pointer">
              I have read and understand the course requirements and examination policies.
            </label>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAcknowledge}
              disabled={!acknowledged}
              data-testid="button-acknowledge-policy"
            >
              I Understand, Begin Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Non-dialog version for inline display
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5" />
          Course Standards & Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
