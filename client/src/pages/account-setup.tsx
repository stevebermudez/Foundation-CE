import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccountSetupPage() {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (licenseNumber && expirationDate) {
      setSubmitted(true);
      // TODO: Save to backend
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Setup Complete!</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Your account is ready. Start exploring CE courses now.
            </p>
            <Button className="w-full" onClick={() => window.location.href = "/"}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Account Setup</h1>
          <p className="text-slate-600 dark:text-slate-300">Add your professional license information</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                License Number
              </label>
              <input 
                type="text" 
                placeholder="Enter your license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                data-testid="input-license-number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                License Expiration Date
              </label>
              <input 
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                data-testid="input-license-expiration"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!licenseNumber || !expirationDate}
              data-testid="button-complete-setup"
            >
              Complete Setup
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
