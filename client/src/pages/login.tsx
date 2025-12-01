import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { SiGoogle, SiFacebook, SiMicrosoft } from "react-icons/si";

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
          <CardContent className="space-y-4">
            <a href="/api/google/login">
              <Button
                className="w-full h-12 text-base gap-2 bg-white text-slate-900 border border-border hover:bg-slate-50"
                data-testid="button-login-google"
              >
                <SiGoogle className="h-5 w-5" />
                Sign In with Google
              </Button>
            </a>

            <a href="/api/facebook/login">
              <Button
                className="w-full h-12 text-base gap-2 bg-[#1877F2] hover:bg-[#165fe5] text-white"
                data-testid="button-login-facebook"
              >
                <SiFacebook className="h-5 w-5" />
                Sign In with Facebook
              </Button>
            </a>

            <a href="/api/microsoft/login">
              <Button
                className="w-full h-12 text-base gap-2 bg-[#0078D4] hover:bg-[#006AB8] text-white"
                data-testid="button-login-microsoft"
              >
                <SiMicrosoft className="h-5 w-5" />
                Sign In with Microsoft
              </Button>
            </a>

            <div className="pt-4">
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
