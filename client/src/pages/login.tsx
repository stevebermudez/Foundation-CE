import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Globe } from "lucide-react";
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
      const response = await fetch("/api/user");
      if (response.ok) {
        setLocation("/dashboard");
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
          <CardContent>
            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="social" data-testid="tab-social">Social</TabsTrigger>
                <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="social" className="space-y-4">
                <a href="/api/google/login">
                  <Button
                    className="w-full h-12 text-base gap-2 bg-white text-slate-900 border border-border hover:bg-slate-50"
                    data-testid="button-login-google"
                  >
                    <SiGoogle className="h-5 w-5" />
                    Sign In with Google
                  </Button>
                </a>

                <Button
                  disabled
                  className="w-full h-12 text-base gap-2 bg-gray-400 text-white cursor-not-allowed opacity-50"
                  data-testid="button-login-microsoft"
                >
                  <Globe className="h-5 w-5" />
                  Sign In with Microsoft (Coming Soon)
                </Button>

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-600 hover:underline font-semibold" data-testid="link-signup">
                      Sign up
                    </a>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
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
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-600 hover:underline font-semibold" data-testid="link-signup-email">
                      Sign up
                    </a>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

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
