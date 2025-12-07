import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Globe, Scale, Users, GraduationCap, BookOpen, FileCheck, UserCheck } from "lucide-react";
import { Link } from "wouter";

export default function LegalCompliance() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="text-legal-compliance-title">Privacy & Security</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FoundationCE is committed to protecting your personal information and maintaining the security of our platform.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>How We Protect Your Data</CardTitle>
                  <CardDescription>Security practices we follow</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We take reasonable measures to protect the personal information you provide to us.
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <span>HTTPS encryption for all data transmitted to and from our website</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <span>Passwords are stored using secure hashing</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <span>Payment processing handled by Stripe, a PCI-compliant provider</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <span>Access to user data is limited to authorized personnel</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card id="privacy">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Your Privacy Rights</CardTitle>
                  <CardDescription>Rights available to our users</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We respect your privacy and provide you with control over your personal information.
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                  <span>Request a copy of your personal data</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                  <span>Request correction of inaccurate information</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                  <span>Request deletion of your account and data</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                  <span>Opt out of marketing communications</span>
                </li>
              </ul>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  To exercise any of these rights, please contact us at <a href="mailto:privacy@foundationce.com" className="text-primary hover:underline">privacy@foundationce.com</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="california">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>California Residents</CardTitle>
                  <CardDescription>Additional rights under California law</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA).
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Scale className="h-4 w-4 mt-1 text-purple-500 shrink-0" />
                  <span>Right to know what personal information we collect</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Scale className="h-4 w-4 mt-1 text-purple-500 shrink-0" />
                  <span>Right to request deletion of your information</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Scale className="h-4 w-4 mt-1 text-purple-500 shrink-0" />
                  <span>Right to opt out of the sale of personal information (we do not sell your data)</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Scale className="h-4 w-4 mt-1 text-purple-500 shrink-0" />
                  <span>Right to non-discrimination for exercising your rights</span>
                </li>
              </ul>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">We Do Not Sell Your Data</h4>
                <p className="text-muted-foreground text-sm">
                  FoundationCE does not sell personal information to third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="education-records">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle>Education Records</CardTitle>
                  <CardDescription>How we handle your course and learning data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We maintain records of your course enrollments, progress, and completions to provide our services and meet state continuing education reporting requirements.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <BookOpen className="h-5 w-5 text-amber-500 mb-2" />
                  <h4 className="font-medium text-sm">Course Records</h4>
                  <p className="text-xs text-muted-foreground">Enrollment, progress, completion dates</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <FileCheck className="h-5 w-5 text-amber-500 mb-2" />
                  <h4 className="font-medium text-sm">Assessment Records</h4>
                  <p className="text-xs text-muted-foreground">Quiz scores, exam results, certificates</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <UserCheck className="h-5 w-5 text-amber-500 mb-2" />
                  <h4 className="font-medium text-sm">Reporting Records</h4>
                  <p className="text-xs text-muted-foreground">CE hours submitted to state agencies</p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Request Your Records</h4>
                <p className="text-muted-foreground text-sm">
                  To request a copy of your education records, email <a href="mailto:records@foundationce.com" className="text-primary hover:underline">records@foundationce.com</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions about our privacy practices or want to exercise your rights, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  Email: <a href="mailto:privacy@foundationce.com" className="text-primary hover:underline">privacy@foundationce.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        <div className="text-center text-sm text-muted-foreground">
          <p>Last updated: December 2024</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
