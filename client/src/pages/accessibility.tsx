import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Accessibility, Phone, Mail, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function AccessibilityPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Accessibility className="h-12 w-12 text-primary" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-4xl font-bold" data-testid="heading-accessibility">
            Accessibility Statement
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FoundationCE is committed to ensuring digital accessibility for people with disabilities. 
            We continually improve the user experience for everyone and apply the relevant accessibility standards.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              FoundationCE is committed to providing a website that is accessible to the widest possible audience, 
              regardless of technology or ability. We aim to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
            <p>
              These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              Conformance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility 
              for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">
                FoundationCE strives to conform to WCAG 2.1 Level AA.
              </p>
            </div>
            <p>
              We are continually working to increase the accessibility and usability of our website and in doing so adhere to many of the available standards and guidelines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>
              Our website includes the following accessibility features:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3" role="list">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard, including navigation menus, forms, and buttons.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Skip Links:</strong> Skip navigation links are provided to allow users to bypass repetitive content and jump directly to main content.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Screen Reader Support:</strong> We use semantic HTML, ARIA landmarks, and proper heading hierarchy to support screen reader users.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Color Contrast:</strong> We maintain sufficient color contrast ratios (at least 4.5:1 for normal text) to ensure readability.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Focus Indicators:</strong> Clear visual focus indicators are provided for all interactive elements.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Text Resizing:</strong> The website supports text resizing up to 200% without loss of content or functionality.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Alternative Text:</strong> Images include descriptive alternative text for screen reader users.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Reduced Motion:</strong> We respect the user's motion preferences for those with vestibular disorders.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>Form Accessibility:</strong> All form fields have associated labels and provide clear error messages.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span><strong>High Contrast Mode:</strong> Our website supports Windows High Contrast Mode for users who need enhanced visibility.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Known Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While we strive for WCAG 2.1 Level AA compliance, we acknowledge that some areas may still need improvement:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Some third-party content or embedded materials may not fully meet accessibility standards.</li>
              <li>PDF documents may require additional accessibility enhancements.</li>
              <li>Some complex interactive features may have limited keyboard accessibility.</li>
            </ul>
            <p>
              We are actively working to address these limitations and welcome your feedback to help us improve.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assistive Technology Compatibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Our website is designed to be compatible with the following assistive technologies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Switch access devices</li>
            </ul>
            <p>
              We test our website on current versions of major browsers combined with these assistive technologies.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              Contact Us
            </CardTitle>
            <CardDescription>
              We welcome your feedback on the accessibility of our website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you experience any difficulty accessing any part of our website, or if you have suggestions for improving accessibility, please contact us:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href="mailto:accessibility@foundationce.com" 
                    className="text-primary hover:underline"
                    data-testid="link-accessibility-email"
                  >
                    accessibility@foundationce.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a 
                    href="tel:+18005551234" 
                    className="text-primary hover:underline"
                    data-testid="link-accessibility-phone"
                  >
                    1-800-555-1234
                  </a>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We try to respond to accessibility feedback within 2 business days.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you are unable to access any content or feature on our website due to a disability, we will work with you to provide the information, 
              item, or transaction in an alternative format or through an alternative method.
            </p>
            <p>
              Please contact us and describe the specific feature you are having difficulty with and we will work to make it accessible.
            </p>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This accessibility statement was last updated on {currentDate}.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" data-testid="button-contact">
                Contact Us
              </Button>
            </Link>
            <Link href="/">
              <Button data-testid="button-home">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
