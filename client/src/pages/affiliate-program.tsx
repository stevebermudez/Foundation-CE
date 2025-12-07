import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Gift, 
  CheckCircle, 
  ArrowRight,
  Percent,
  Clock,
  CreditCard,
  ExternalLink
} from "lucide-react";

export default function AffiliateProgramPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4" data-testid="badge-affiliate">
            Partner Program
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-affiliate-title">
            Earn Money Promoting<br />Continuing Education
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="text-affiliate-description">
            Join our affiliate program and earn commissions by referring real estate and insurance 
            professionals to our state-approved continuing education courses.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild data-testid="button-affiliate-apply">
              <a href="https://promotekit.com" target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-affiliate-login">
              <a href="https://promotekit.com" target="_blank" rel="noopener noreferrer">
                Affiliate Login
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-commission-title">
            Competitive Commission Rates
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Earn generous commissions on every sale you refer. Our tiered structure rewards 
            your success with increasing rates.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center" data-testid="card-commission-starter">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Percent className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Starter</CardTitle>
                <CardDescription>0-10 sales/month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">15%</div>
                <p className="text-sm text-muted-foreground">Commission per sale</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary" data-testid="card-commission-pro">
              <CardHeader>
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Pro Partner</CardTitle>
                <CardDescription>11-50 sales/month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">20%</div>
                <p className="text-sm text-muted-foreground">Commission per sale</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-commission-elite">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Elite Partner</CardTitle>
                <CardDescription>50+ sales/month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">25%</div>
                <p className="text-sm text-muted-foreground">Commission per sale</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-benefits-title">
            Why Partner With Us?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-benefit-tracking">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">60-Day Cookie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Extended tracking window ensures you get credit for referrals even if they don't purchase immediately.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-benefit-payments">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Fast Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monthly PayPal or Wise payouts with no minimum threshold. Get paid for every sale.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-benefit-marketing">
              <CardHeader>
                <Gift className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Marketing Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access banners, email templates, and promotional content to help you convert more referrals.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-benefit-dashboard">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Real-Time Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track clicks, conversions, and earnings in real-time with detailed analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-howto-title">
            How It Works
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start" data-testid="step-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Apply for the Program</h3>
                <p className="text-muted-foreground">
                  Fill out a quick application form. We review applications within 24-48 hours 
                  and notify you via email once approved.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start" data-testid="step-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Your Unique Link</h3>
                <p className="text-muted-foreground">
                  Once approved, access your affiliate dashboard to get your unique referral links 
                  and promotional materials.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start" data-testid="step-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share & Promote</h3>
                <p className="text-muted-foreground">
                  Share your links via your website, blog, social media, email newsletters, 
                  or any other marketing channels.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start" data-testid="step-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Earn Commissions</h3>
                <p className="text-muted-foreground">
                  When someone clicks your link and purchases a course, you earn a commission. 
                  Track everything in real-time on your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-audience-title">
            Perfect For
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our affiliate program is ideal for anyone with connections to the real estate 
            or insurance industry.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-audience-bloggers">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Industry Bloggers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real estate content creators
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Insurance industry writers
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Career advice websites
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card data-testid="card-audience-brokers">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Brokers & Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real estate brokerages
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Insurance agencies
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Training coordinators
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card data-testid="card-audience-influencers">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Social Influencers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    YouTube educators
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    LinkedIn professionals
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Industry podcasters
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our affiliate program today and turn your network into income.
          </p>
          <Button size="lg" asChild data-testid="button-cta-apply">
            <a href="https://promotekit.com" target="_blank" rel="noopener noreferrer">
              Apply for Affiliate Program <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card data-testid="faq-1">
              <CardHeader>
                <CardTitle className="text-lg">How much can I earn?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your earnings depend on how many referrals convert into customers. 
                  With course prices ranging from $50-$200+ and commission rates of 15-25%, 
                  top affiliates earn several thousand dollars per month.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="faq-2">
              <CardHeader>
                <CardTitle className="text-lg">When do I get paid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Commissions are paid monthly via PayPal or Wise. There's no minimum 
                  payout threshold—you get paid for every sale you refer.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="faq-3">
              <CardHeader>
                <CardTitle className="text-lg">Is there an approval process?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we review all applications to ensure quality partnerships. 
                  Most applications are reviewed within 24-48 hours. We look for 
                  affiliates with genuine connections to our target audience.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="faq-4">
              <CardHeader>
                <CardTitle className="text-lg">Can I use paid advertising?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you may use paid advertising to promote your affiliate links, 
                  but bidding on our brand name keywords is not permitted. 
                  Please review our affiliate terms for complete guidelines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
