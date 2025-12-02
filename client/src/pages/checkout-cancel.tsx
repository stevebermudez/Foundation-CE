import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function CheckoutCancelPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-orange-700 dark:text-orange-300">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-center text-slate-700 dark:text-slate-300">
                Your payment was not completed. You have not been charged.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setLocation("/courses/fl")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-return-to-courses"
              >
                Return to Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-return-home"
              >
                Return Home
              </Button>
            </div>

            <div className="border-t pt-4 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                If you encountered any issues, please contact our support team or try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
