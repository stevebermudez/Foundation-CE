import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch("/api/user", { headers });
        if (response.ok) {
          setLocation("/dashboard");
        }
      } catch (err) {
        // User not authenticated, show login page
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Email and password required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("authToken", data.token);
        toast({ title: "Success", description: "Login successful!" });
        setLocation("/dashboard");
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Login failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to FoundationCE</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to access your Florida prelicensing courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Login */}
            <a href="/api/google/login" className="w-full block">
              <Button
                className="w-full h-12 text-base gap-2 bg-white text-slate-900 border border-border hover:bg-slate-50"
                data-testid="button-login-google"
              >
                <SiGoogle className="h-5 w-5" />
                Sign In with Google
              </Button>
            </a>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Login */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email-login"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password-login"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={loading}
                data-testid="button-login-email"
              >
                {loading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </form>

            {/* Signup & Forgot Password Links */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:underline font-semibold" data-testid="link-signup">
                  Sign up
                </a>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                <a href="/forgot-password" className="text-blue-600 hover:underline font-semibold" data-testid="link-forgot-password">
                  Forgot your password?
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
