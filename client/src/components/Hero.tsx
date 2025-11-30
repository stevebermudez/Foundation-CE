import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, CheckCircle, Smartphone } from "lucide-react";
import heroImage from "@assets/generated_images/professional_real_estate_training_classroom.png";

interface HeroProps {
  onBrowseCourses: () => void;
  onGetStarted: () => void;
}

export default function Hero({ onBrowseCourses, onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[550px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[750px] flex items-center">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional training classroom"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full py-8 sm:py-12">
        <div className="max-w-3xl">
          <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge className="bg-white/15 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 transition-colors text-xs sm:text-sm">
              <Zap className="h-3 w-3 mr-1" />
              State Approved
            </Badge>
            <Badge className="bg-white/15 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 transition-colors text-xs sm:text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Compliance Tracking
            </Badge>
            <Badge className="bg-white/15 text-white border-white/25 backdrop-blur-sm hover:bg-white/20 transition-colors text-xs sm:text-sm hidden sm:inline-flex">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile Optimized
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            CE & Prelicensing,
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/85 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
            Complete state-approved continuing education courses with video lessons and instant certificates. For California and Florida real estate or insurance professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="gap-2 bg-white text-black hover:bg-white/90 font-semibold w-full sm:w-auto"
              data-testid="button-get-started"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBrowseCourses}
              className="bg-white/10 border-white/40 text-white backdrop-blur hover:bg-white/20 font-semibold w-full sm:w-auto"
              data-testid="button-browse-courses"
            >
              Browse Courses
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-white/80 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">Instant certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">Auto-reporting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">Learn anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
