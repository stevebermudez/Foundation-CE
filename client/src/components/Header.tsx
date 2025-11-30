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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "./ThemeProvider";
import logoImage from "@assets/IMG_6802_1764527356008.png";
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

type Profession = "real_estate" | "insurance";

interface HeaderProps {
  selectedProfession: Profession;
  onProfessionChange: (profession: Profession) => void;
}

export default function Header({ selectedProfession, onProfessionChange }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { label: "Browse Courses", href: "/courses", icon: BookOpen },
    { label: "My Courses", href: "/dashboard", icon: GraduationCap },
    { label: "Compliance", href: "/compliance", icon: ClipboardCheck },
    { label: "Resources", href: "/resources", icon: FileText },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-2">
        <div className="flex h-16 items-center justify-between gap-1">
          <div className="flex items-center gap-1 flex-shrink-0 mr-auto">
            <Link href="/" className="flex items-center gap-1 hover-elevate rounded-md px-1 py-1 -ml-1">
              <img src={logoImage} alt="FoundationCE Logo" className="h-10 w-10" />
              <span 
                className="font-black text-sm text-blue-600 whitespace-nowrap" 
                data-testid="text-logo"
              >
                Foundation CE
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-profession-selector">
                  <Badge variant="secondary" className="mr-1">
                    {selectedProfession === "real_estate" ? "RE" : "Ins"}
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onProfessionChange("real_estate")} data-testid="menu-item-real-estate">
                  <span className="font-medium">Real Estate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onProfessionChange("insurance")} data-testid="menu-item-insurance">
                  <span className="font-medium">Insurance</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1"
                  data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
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

            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-4">
                  <div className="font-semibold">Notifications</div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="text-sm p-2 rounded border border-border hover-elevate cursor-pointer">
                      <p className="font-medium">New course available</p>
                      <p className="text-xs text-muted-foreground">Advanced Real Estate Law just released</p>
                    </div>
                    <div className="text-sm p-2 rounded border border-border hover-elevate cursor-pointer">
                      <p className="font-medium">Certificate expiring soon</p>
                      <p className="text-xs text-muted-foreground">Your Florida CE certificate expires in 30 days</p>
                    </div>
                    <div className="text-sm p-2 rounded border border-border hover-elevate cursor-pointer">
                      <p className="font-medium">Exam results ready</p>
                      <p className="text-xs text-muted-foreground">You scored 92% on the Ethics exam</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
