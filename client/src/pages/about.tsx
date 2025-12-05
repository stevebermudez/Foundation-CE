import { usePageMeta } from "@/hooks/use-page-meta";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Lightbulb, Users, Target } from "lucide-react";

export default function AboutPage() {
  usePageMeta({
    title: "About FoundationCE - Modern Real Estate Education",
    description: "Founded by tenured real estate brokers who reimagined continuing education with modern technology, engaging content, and professional-grade learning experience.",
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-20 px-4 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Founded by tenured real estate brokers who saw an opportunity to transform continuing education
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Why We Built FoundationCE
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="mb-4 flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-slate-900 dark:text-white">
                  Tired of Dated Content
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  We experienced firsthand how outdated and tedious real estate education materials have become. The industry deserved better.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="mb-4 flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-slate-900 dark:text-white">
                  Building the Modern Alternative
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  We created FoundationCE with cutting-edge technology, engaging content, and an intuitive experience that professionals actually enjoy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Who We Are
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Our founding team consists of experienced real estate brokers with decades of combined industry experience. We've worked in the trenches—closing deals, managing teams, and earning our licenses. That real-world perspective shaped every decision we made with FoundationCE.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            We understand the unique challenges real estate and insurance professionals face. We know what it takes to stay compliant while growing your business. And we know that your time is valuable, which is why we built a platform that respects both your time and your intelligence.
          </p>
        </div>
      </section>

      {/* Official Licensing */}
      <section className="py-16 px-4 bg-slate-100 dark:bg-slate-800/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">
            Official Licensing
          </h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                    Corporate Entity
                  </h3>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400">
                    <p><span className="font-medium">Legal Entity:</span> Haymakers, Inc., a Delaware corporation</p>
                    <p><span className="font-medium">Registered to Transact Business in Florida as:</span> Haymakers FL, Inc. dba Foundation CE</p>
                    <p><span className="font-medium">Address:</span> 10 E. Yanonali Street #134<br />Santa Barbara, CA 93101</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                    Florida DBPR School Permit
                  </h3>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400">
                    <p><span className="font-medium">Permit Number:</span> ZH1003162</p>
                    <p><span className="font-medium">Regulator:</span> FL Dept. of Business and Professional Regulation</p>
                    <p><span className="font-medium">Division:</span> Division of Real Estate</p>
                    <p><span className="font-medium">Authority:</span> Chapter 475, Florida Statutes</p>
                    <p><span className="font-medium">Issued:</span> December 2, 2025</p>
                    <p><span className="font-medium">Expires:</span> September 30, 2027</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Verify permit at{" "}
                  <a 
                    href="https://www.myfloridalicense.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    MyFloridaLicense.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-center text-slate-900 dark:text-white">
                  Professional First
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  We design everything with professionals in mind—because you deserve tools that match your expertise.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="mb-4 flex items-center justify-center">
                  <Target className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-center text-slate-900 dark:text-white">
                  Compliance & Excellence
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  We meet every regulatory requirement while delivering an experience that goes above and beyond.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="mb-4 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-center text-slate-900 dark:text-white">
                  Continuous Improvement
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  We listen to our users and constantly evolve our platform to serve the industry better.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who've upgraded to modern, professional education
          </p>
          <a
            href="/courses/fl"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
            data-testid="link-view-courses-about"
          >
            Explore Our Courses
          </a>
        </div>
      </section>
    </div>
  );
}
