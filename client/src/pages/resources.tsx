import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Search,
  BookOpen,
  Scale,
  Shield,
  Building,
  ExternalLink,
} from "lucide-react";

interface ResourcesPageProps {
  selectedState: "CA" | "FL";
}

// todo: remove mock functionality
const mockResources = {
  guides: [
    {
      id: "1",
      title: "California Real Estate License Renewal Guide",
      description: "Complete guide to renewing your California real estate license including CE requirements.",
      pages: 24,
      size: "1.2 MB",
      state: "CA",
    },
    {
      id: "2",
      title: "Florida FREC License Renewal Checklist",
      description: "Step-by-step checklist for Florida real estate professionals.",
      pages: 12,
      size: "650 KB",
      state: "FL",
    },
    {
      id: "3",
      title: "Insurance CE Requirements by State",
      description: "Comprehensive overview of insurance continuing education requirements.",
      pages: 36,
      size: "2.1 MB",
      state: "ALL",
    },
  ],
  regulations: [
    {
      id: "4",
      title: "DRE Regulations Reference",
      description: "California Department of Real Estate regulations and statutes.",
      url: "https://www.dre.ca.gov/",
      state: "CA",
    },
    {
      id: "5",
      title: "FREC Rules and Statutes",
      description: "Florida Real Estate Commission official rules.",
      url: "https://www.myfloridalicense.com/DBPR/real-estate-commission/",
      state: "FL",
    },
  ],
  forms: [
    {
      id: "6",
      title: "CE Course Completion Certificate Template",
      description: "Official certificate template for completed courses.",
      size: "245 KB",
    },
    {
      id: "7",
      title: "License Renewal Application",
      description: "Standard license renewal application form.",
      size: "180 KB",
    },
  ],
};

export default function ResourcesPage({ selectedState }: ResourcesPageProps) {
  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">
            Educational materials, regulatory guides, and helpful documents for your continuing education journey.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
            data-testid="input-search-resources"
          />
        </div>

        <Tabs defaultValue="guides">
          <TabsList className="mb-6">
            <TabsTrigger value="guides" className="gap-2" data-testid="tab-guides">
              <BookOpen className="h-4 w-4" />
              Study Guides
            </TabsTrigger>
            <TabsTrigger value="regulations" className="gap-2" data-testid="tab-regulations">
              <Scale className="h-4 w-4" />
              Regulations
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-2" data-testid="tab-forms">
              <FileText className="h-4 w-4" />
              Forms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="space-y-4">
            {mockResources.guides.map((resource) => (
              <Card key={resource.id} className="hover-elevate">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{resource.title}</h3>
                      {resource.state !== "ALL" && (
                        <Badge variant="outline" className="text-xs">{resource.state}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {resource.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resource.pages} pages • {resource.size}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" data-testid={`button-download-${resource.id}`}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="regulations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">California DRE</CardTitle>
                      <p className="text-sm text-muted-foreground">Department of Real Estate</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access official California DRE regulations, license lookup, and renewal information.
                  </p>
                  <Button variant="outline" className="w-full gap-2" data-testid="button-dre-link">
                    Visit DRE Website
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Florida FREC</CardTitle>
                      <p className="text-sm text-muted-foreground">Real Estate Commission</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access Florida FREC rules, license verification, and continuing education requirements.
                  </p>
                  <Button variant="outline" className="w-full gap-2" data-testid="button-frec-link">
                    Visit FREC Website
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Regulatory Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockResources.regulations.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                      <Badge variant="outline">{resource.state}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            {mockResources.forms.map((form) => (
              <Card key={form.id} className="hover-elevate">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{form.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {form.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF • {form.size}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" data-testid={`button-download-form-${form.id}`}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
