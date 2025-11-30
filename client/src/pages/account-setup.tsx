import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

export default function AccountSetupPage() {
  const [accountType, setAccountType] = useState<"individual" | "company" | null>(null);

  if (!accountType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Choose Your Account Type</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">Select how you want to use FoundationCE</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              onClick={() => setAccountType("individual")}
              className="p-8 cursor-pointer hover-elevate border-2 hover:border-primary transition-colors"
              data-testid="card-account-individual"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Individual</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Take CE courses, track your licenses and compliance renewals
                </p>
                <Button className="w-full" data-testid="button-account-individual">Get Started</Button>
              </div>
            </Card>

            <Card 
              onClick={() => setAccountType("company")}
              className="p-8 cursor-pointer hover-elevate border-2 hover:border-primary transition-colors"
              data-testid="card-account-company"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Company</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Manage employees, track compliance, and review CE completions
                </p>
                <Button className="w-full" data-testid="button-account-company">Get Started</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            {accountType === "individual" ? "Individual Account Setup" : "Company Account Setup"}
          </h1>
          
          {accountType === "individual" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Number
                </label>
                <input 
                  type="text" 
                  placeholder="Enter your license number"
                  className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  data-testid="input-license-number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  License Expiration Date
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  data-testid="input-license-expiration"
                />
              </div>
              <Button className="w-full" data-testid="button-complete-individual-setup">
                Complete Setup
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name
                </label>
                <input 
                  type="text" 
                  placeholder="Enter company name"
                  className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  data-testid="input-company-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company License Number
                </label>
                <input 
                  type="text" 
                  placeholder="Enter license number"
                  className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  data-testid="input-company-license"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Number of Employees
                </label>
                <input 
                  type="number" 
                  placeholder="Enter employee count"
                  className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  data-testid="input-employee-count"
                />
              </div>
              <Button className="w-full" data-testid="button-complete-company-setup">
                Complete Setup
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
