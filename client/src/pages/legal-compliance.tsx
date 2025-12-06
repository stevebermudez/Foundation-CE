import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Globe, FileCheck, CheckCircle2, Building2, Scale, Users } from "lucide-react";
import { Link } from "wouter";

export default function LegalCompliance() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="text-legal-compliance-title">Compliance & Security</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FoundationCE maintains the highest standards of data protection, security, and regulatory compliance to protect your information and ensure trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>SOC 2 Type II</CardTitle>
              <CardDescription>Certified</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">Active</Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mb-2">
                <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>GDPR</CardTitle>
              <CardDescription>Compliant</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">Active</Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mb-2">
                <Scale className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>CCPA</CardTitle>
              <CardDescription>Compliant</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">Active</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card id="soc2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>SOC 2 Type II Compliance</CardTitle>
                  <CardDescription>Service Organization Control 2</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                FoundationCE has achieved SOC 2 Type II certification, demonstrating our commitment to maintaining the highest standards of security, availability, processing integrity, confidentiality, and privacy.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Trust Service Criteria</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Security - Protection against unauthorized access</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Availability - System accessibility as committed</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Processing Integrity - Accurate and timely processing</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Confidentiality - Protected information handling</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Privacy - Personal information protection</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Security Controls</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Encryption at rest and in transit (AES-256, TLS 1.3)</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Multi-factor authentication</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Role-based access controls</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Continuous monitoring and alerting</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Regular penetration testing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="gdpr">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>GDPR Compliance</CardTitle>
                  <CardDescription>General Data Protection Regulation (EU)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                We comply with the European Union's General Data Protection Regulation (GDPR), ensuring that personal data of EU residents is processed lawfully, fairly, and transparently.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Data Subject Rights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to access personal data</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to rectification</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to erasure ("right to be forgotten")</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to restrict processing</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to data portability</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Right to object to processing</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Our Commitments</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Lawful basis for all data processing</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Data Protection Impact Assessments</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Designated Data Protection Officer</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>72-hour breach notification</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Privacy by design and default</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span>Standard Contractual Clauses for transfers</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                <p className="text-muted-foreground text-sm">
                  For GDPR-related inquiries, contact our DPO at <a href="mailto:dpo@foundationce.com" className="text-primary hover:underline">dpo@foundationce.com</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="ccpa">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>CCPA Compliance</CardTitle>
                  <CardDescription>California Consumer Privacy Act</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                We comply with the California Consumer Privacy Act (CCPA), providing California residents with specific rights regarding their personal information.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Your CCPA Rights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Right to know what data is collected</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Right to know if data is sold or disclosed</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Right to opt-out of data sale</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Right to request deletion</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span>Right to non-discrimination</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Categories of Data Collected</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Identifiers (name, email, license numbers)</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileCheck className="h-4 w-4 text-purple-500" />
                      <span>Professional information</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      <span>Commercial information (purchases)</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span>Internet activity (course progress)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Do Not Sell My Personal Information</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  FoundationCE does not sell personal information. However, California residents can submit a "Do Not Sell" request.
                </p>
                <Link href="/privacy-policy" className="text-primary hover:underline text-sm">
                  Learn more about your rights →
                </Link>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Submit a CCPA Request</h4>
                <p className="text-muted-foreground text-sm">
                  To exercise your CCPA rights, email <a href="mailto:privacy@foundationce.com" className="text-primary hover:underline">privacy@foundationce.com</a> with your request. We will respond within 45 days.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="mx-auto p-3 bg-muted rounded-full w-fit mb-3">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Encryption</h3>
                  <p className="text-sm text-muted-foreground">AES-256 at rest, TLS 1.3 in transit</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto p-3 bg-muted rounded-full w-fit mb-3">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Monitoring</h3>
                  <p className="text-sm text-muted-foreground">24/7 security monitoring and alerting</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto p-3 bg-muted rounded-full w-fit mb-3">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Audits</h3>
                  <p className="text-sm text-muted-foreground">Annual third-party security audits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground">
            <p className="mb-4">For compliance inquiries or to request documentation:</p>
            <p><strong>Email:</strong> compliance@foundationce.com</p>
          </div>

          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
