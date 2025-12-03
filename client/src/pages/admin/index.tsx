import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminIndexPage() {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          setLocation("/admin/login");
          return;
        }

        const response = await fetch("/api/auth/is-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            setLocation("/admin/dashboard");
          } else {
            localStorage.removeItem("adminToken");
            setLocation("/admin/login");
          }
        } else {
          localStorage.removeItem("adminToken");
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("adminToken");
        setLocation("/admin/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAuth();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
