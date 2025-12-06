import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, FileText, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-privacy-title">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: December 6, 2025</p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">GDPR Compliant</Badge>
            <Badge variant="outline">CCPA Compliant</Badge>
            <Badge variant="outline">SOC 2 Type II</Badge>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                FoundationCE ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our continuing education platform for real estate and insurance professionals.
              </p>
              <p>
                We comply with applicable data protection laws including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and maintain SOC 2 Type II certification for security controls.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Name, email address, and contact information</li>
                  <li>Professional license numbers and credentials</li>
                  <li>Payment and billing information</li>
                  <li>Course enrollment and completion records</li>
                  <li>Exam scores and certification data</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Course progress and learning analytics</li>
                  <li>Login times and session duration</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain our educational services</li>
                <li>Process course enrollments and payments</li>
                <li>Issue certificates and report completions to regulatory bodies (e.g., Florida DBPR)</li>
                <li>Send course-related notifications and reminders</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Regulatory Bodies:</strong> State licensing boards (Florida DBPR, California DRE) for course completion reporting</li>
                <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
                <li><strong>Service Providers:</strong> Cloud hosting, email delivery, and analytics services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We never sell your personal information to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">All Users Have the Right To:</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Additional Rights for California Residents (CCPA)</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Know what personal information is collected</li>
                  <li>Know if your personal information is sold or disclosed</li>
                  <li>Say no to the sale of personal information</li>
                  <li>Equal service and price, even if you exercise privacy rights</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Additional Rights for EU/EEA Residents (GDPR)</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Right to restriction of processing</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent at any time</li>
                  <li>Right to lodge a complaint with a supervisory authority</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>SOC 2 Type II certified security controls</li>
                <li>256-bit SSL/TLS encryption for data in transit</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication options</li>
                <li>Role-based access controls</li>
                <li>Automated threat detection and monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Course completion records and certificates are retained for a minimum of 7 years to meet regulatory requirements. You may request deletion of non-essential data at any time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Track course progress</li>
                <li>Analyze platform usage for improvements</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For privacy-related inquiries or to exercise your rights:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@foundationce.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@foundationce.com</p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>FoundationCE, LLC</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
            <Link href="/legal-compliance" className="hover:underline">Security & Compliance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
