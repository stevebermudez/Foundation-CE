import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Cookie, Settings, Shield, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CONSENT_STORAGE_KEY = "foundationce_cookie_consent";
const CONSENT_VERSION = "1.0";

function getVisitorId(): string {
  let visitorId = localStorage.getItem("foundationce_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("foundationce_visitor_id", visitorId);
  }
  return visitorId;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    // Don't show cookie consent on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }
    
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else {
          setSettings(parsed.settings);
        }
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = async (consentSettings: ConsentSettings) => {
    const consentData = {
      version: CONSENT_VERSION,
      settings: consentSettings,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    
    try {
      await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          consents: Object.entries(consentSettings).map(([type, consented]) => ({
            consentType: type,
            consented: consented ? 1 : 0,
          })),
          source: "cookie_banner",
          version: CONSENT_VERSION,
        }),
      });
    } catch (error) {
      console.error("Failed to save consent to server:", error);
    }
    
    setSettings(consentSettings);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(settings);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {showBanner && !showPreferences && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg"
          role="dialog"
          aria-label="Cookie consent"
          data-testid="cookie-consent-banner"
        >
          <div className="container mx-auto max-w-6xl">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">We value your privacy</p>
                      <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
                        By clicking "Accept All", you consent to our use of cookies. 
                        Read our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for more information.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowBanner(false);
                        setShowPreferences(true);
                      }}
                      data-testid="button-cookie-preferences"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Preferences
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectNonEssential}
                      data-testid="button-reject-cookies"
                    >
                      Reject Non-Essential
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      data-testid="button-accept-cookies"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences below. Necessary cookies are always enabled as they are essential for the website to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Necessary Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Essential for the website to function. Cannot be disabled.
                  </p>
                </div>
                <Switch checked={true} disabled data-testid="switch-necessary" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="font-medium">Analytics Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => setSettings({ ...settings, analytics: checked })}
                  data-testid="switch-analytics"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="font-medium">Marketing Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                </div>
                <Switch
                  checked={settings.marketing}
                  onCheckedChange={(checked) => setSettings({ ...settings, marketing: checked })}
                  data-testid="switch-marketing"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="font-medium">Functional Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable personalized features like preferences and saved settings.
                  </p>
                </div>
                <Switch
                  checked={settings.functional}
                  onCheckedChange={(checked) => setSettings({ ...settings, functional: checked })}
                  data-testid="switch-functional"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                For more information about how we use your data, please read our{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                {" "}and{" "}
                <Link href="/legal-compliance" className="text-primary hover:underline">Compliance Information</Link>.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPreferences(false)} data-testid="button-cancel-preferences">
              Cancel
            </Button>
            <Button onClick={handleSavePreferences} data-testid="button-save-preferences">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
