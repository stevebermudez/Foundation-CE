import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock, Award, Shield } from "lucide-react";
import heroImage from "@assets/generated_images/professional_real_estate_training_classroom.png";

interface HeroProps {
  onBrowseCourses: () => void;
  onGetStarted: () => void;
}

export default function Hero({ onBrowseCourses, onGetStarted }: HeroProps) {
  const features = [
    { icon: Shield, text: "DRE & FREC Approved" },
    { icon: Clock, text: "Timed & Untimed Options" },
    { icon: Award, text: "Instant Certificates" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional training classroom"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur">
              California
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur">
              Florida
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur">
              Real Estate
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur">
              Insurance
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Professional Continuing Education Made Simple
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
            Complete your CE requirements on your schedule with state-approved courses. 
            Choose timed or untimed exams, watch video lessons, and download comprehensive 
            study guides - all in one platform.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-white/90"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="gap-2"
              data-testid="button-get-started"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBrowseCourses}
              className="bg-white/10 border-white/30 text-white backdrop-blur hover:bg-white/20"
              data-testid="button-browse-courses"
            >
              Browse Courses
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm">Start learning today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
