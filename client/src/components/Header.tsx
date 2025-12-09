import { useState, useEffect } from "react";
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
  Mail,
  Check,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function Header() {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user", {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for auth changes (login/signup/logout)
  useEffect(() => {
    const handleAuthUpdate = () => {
      checkAuth();
    };
    window.addEventListener("auth:updated", handleAuthUpdate);
    return () => window.removeEventListener("auth:updated", handleAuthUpdate);
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const headers = getAuthHeaders();
        const [notifResponse, countResponse] = await Promise.all([
          fetch("/api/notifications", { headers }),
          fetch("/api/notifications/count", { headers })
        ]);
        
        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          setNotifications(notifData);
        }
        
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setUnreadCount(countData.count);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { 
        method: "PATCH",
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { 
        method: "POST",
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      setLocation(notification.link);
      setNotificationsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      window.location.href = "/api/logout";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleProfileClick = () => {
    setLocation("/account-setup");
  };

  const navItems = [
    { label: "Courses", href: "/courses/fl", icon: BookOpen },
    { label: "My Courses", href: "/dashboard", icon: GraduationCap },
    { label: "Compliance", href: "/compliance", icon: ClipboardCheck },
    { label: "About", href: "/about", icon: FileText },
    { label: "Contact", href: "/contact", icon: Mail },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="mx-auto max-w-7xl px-2">
        <div className="flex h-16 items-center justify-between gap-1">
          <div className="flex items-center gap-1 flex-shrink-0 mr-auto">
            <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-1 py-1 -ml-1" aria-label="Foundation CE - Go to homepage">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary" aria-hidden="true">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span 
                className="font-semibold text-lg whitespace-nowrap" 
                data-testid="text-logo"
              >
                Foundation CE
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
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
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {user ? (
              <>
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
                      <Bell className="h-4 w-4" aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={markAllAsRead}
                            className="text-xs h-6"
                            data-testid="button-mark-all-read"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`text-sm p-2 rounded border cursor-pointer group relative ${
                                notification.read 
                                  ? "border-border bg-muted/30" 
                                  : "border-primary/30 bg-primary/5"
                              } hover-elevate`}
                              onClick={() => handleNotificationClick(notification)}
                              data-testid={`notification-${notification.id}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium truncate ${notification.read ? "text-muted-foreground" : ""}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground/60 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  data-testid={`button-delete-notification-${notification.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              {!notification.read && (
                                <div className="absolute top-2 right-8 h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu" aria-label="User menu">
                      <User className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleProfileClick} data-testid="menu-item-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleProfileClick} data-testid="menu-item-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu" aria-label="Open mobile menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72" aria-label="Mobile navigation">
                <nav className="flex flex-col gap-2 mt-8" role="navigation" aria-label="Mobile navigation">
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
