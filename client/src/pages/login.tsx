import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Github, Globe } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/user");
      if (response.ok) {
        setLocation("/dashboard");
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleLogin = (provider: string) => {
    window.location.href = "/api/login";
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
              Sign in with your Replit account or email to access your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700"
              data-testid="button-login-replit"
            >
              <LogIn className="h-5 w-5" />
              Sign In with Replit
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Signing in with Replit allows you to use Google, GitHub, X, or Apple login methods.
            </p>

            <div className="pt-4">
              <p className="text-xs text-muted-foreground text-center">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            First time here?{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={handleLogin}>
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
