import { Link } from "wouter";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { label: "Real Estate CE", href: "/courses?profession=real_estate" },
      { label: "Insurance CE", href: "/courses?profession=insurance" },
      { label: "California Courses", href: "/courses?state=CA" },
      { label: "Florida Courses", href: "/courses?state=FL" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Technical Support", href: "/support" },
    ],
    compliance: [
      { label: "DRE Requirements", href: "/compliance/ca" },
      { label: "FREC Requirements", href: "/compliance/fl" },
      { label: "Course Approvals", href: "/approvals" },
      { label: "Reporting Status", href: "/reporting" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-card border-t">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">FoundationCE</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              State-approved continuing education for real estate and insurance professionals in California and Florida.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-facebook"
              >
                <SiFacebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-linkedin"
              >
                <SiLinkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-twitter"
              >
                <SiX className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Compliance</h4>
            <ul className="space-y-2">
              {footerLinks.compliance.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                1-800-PRO-CEED
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@proce.com
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>123 Education Way<br />Los Angeles, CA 90001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} ProCE. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>CA DRE Provider #S0123</span>
              <span>|</span>
              <span>FL DBPR Provider #0012345</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
