import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Mail, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }

      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        return;
      }

      // Check if user is admin
      const userRes = await fetch("/api/auth/user");
      if (!userRes.ok) {
        setError("Failed to verify admin status");
        return;
      }

      const user = await userRes.json();
      const isAdminRes = await fetch("/api/auth/is-admin");
      const adminData = await isAdminRes.json();

      if (!adminData.isAdmin) {
        setError("Admin access required. Please contact support.");
        return;
      }

      setLocation("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800">
        <CardHeader className="space-y-2 border-b border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">Admin Console</span>
          </div>
          <CardTitle className="text-center">Admin Login</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Restricted access - Authorized administrators only
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-950 border-red-700"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@foundationce.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600"
                data-testid="input-admin-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600"
                data-testid="input-admin-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              data-testid="button-admin-login"
            >
              {isLoading ? "Logging in..." : "Sign In as Admin"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400">
            <p className="font-semibold mb-2">Demo Admin Credentials:</p>
            <p>Email: admin@foundationce.com</p>
            <p>Password: admin1234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
