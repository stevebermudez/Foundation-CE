import { Link } from "wouter";
import { GraduationCap, Mail, MapPin } from "lucide-react";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { label: "Florida Courses", href: "/courses/fl" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Compliance Tracker", href: "/compliance" },
    ],
    support: [
      { label: "Get Started", href: "/account-setup" },
      { label: "Browse Courses", href: "/courses/fl" },
      { label: "Contact", href: "#contact" },
      { label: "Email: support@foundationce.com", href: "mailto:support@foundationce.com" },
    ],
    compliance: [
      { label: "Compliance Tracker", href: "/compliance" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Home", href: "/" },
      { label: "Account Setup", href: "/account-setup" },
    ],
    company: [
      { label: "Home", href: "/" },
      { label: "Terms & Conditions", href: "#terms" },
      { label: "Privacy", href: "#privacy" },
      { label: "Support Email", href: "mailto:support@foundationce.com" },
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
              State-approved continuing education and prelicensing for real estate professionals in Florida.
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
                <Mail className="h-4 w-4" />
                support@foundationce.com
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>10 E Yanonali Street #134<br />Santa Barbara, CA 93101</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} FoundationCE. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>FL DBPR Provider #0012345</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
