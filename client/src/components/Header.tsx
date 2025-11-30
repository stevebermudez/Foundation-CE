import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "./ThemeProvider";
import logoImage from "@assets/generated_images/foundationce_modern_teal_gradient_logo_design.png";
import {
  GraduationCap,
  Menu,
  Sun,
  Moon,
  User,
  BookOpen,
  ClipboardCheck,
  FileText,
  ChevronDown,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";

type State = "CA" | "FL";

interface HeaderProps {
  selectedState: State;
  onStateChange: (state: State) => void;
}

export default function Header({ selectedState, onStateChange }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Browse Courses", href: "/courses", icon: BookOpen },
    { label: "My Courses", href: "/dashboard", icon: GraduationCap },
    { label: "Compliance", href: "/compliance", icon: ClipboardCheck },
    { label: "Resources", href: "/resources", icon: FileText },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1">
              <img src={logoImage} alt="FoundationCE Logo" className="h-8 w-8" />
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-sm text-gray-900 dark:text-white" data-testid="text-logo">
                  FoundationCE
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Continuing Education</span>
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-state-selector">
                  <Badge variant="secondary" className="mr-1">
                    {selectedState}
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onStateChange("CA")} data-testid="menu-item-california">
                  <span className="font-medium">California</span>
                  <span className="ml-2 text-muted-foreground text-sm">DRE</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStateChange("FL")} data-testid="menu-item-florida">
                  <span className="font-medium">Florida</span>
                  <span className="ml-2 text-muted-foreground text-sm">FREC</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="menu-item-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-item-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        data-testid={`mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
