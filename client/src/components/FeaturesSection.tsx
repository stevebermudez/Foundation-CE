import { Card, CardContent } from "@/components/ui/card";
import {
  Video,
  FileText,
  Award,
  Shield,
  Smartphone,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video-Based Learning",
    description:
      "Engaging video content for every lesson with expert instructors and real-world examples.",
  },
  {
    icon: FileText,
    title: "Comprehensive Study Materials",
    description:
      "Downloadable guides and resources for each course to reference anytime.",
  },
  {
    icon: Shield,
    title: "State Approved",
    description:
      "All courses are approved by FREC (Florida) for CE and prelicensing credit.",
  },
  {
    icon: Award,
    title: "Instant Certificates",
    description:
      "Download your completion certificates immediately after passing your assessment.",
  },
  {
    icon: Smartphone,
    title: "Learn Anywhere",
    description:
      "Access courses on any device - desktop, tablet, or mobile - at your convenience.",
  },
  {
    icon: BookOpen,
    title: "Auto-Reporting",
    description:
      "We automatically report your completions to the appropriate regulatory agencies.",
  },
];

export default function FeaturesSection() {
  const colorMap = [
    "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    "from-pink-500/20 to-pink-600/20 border-pink-500/30",
    "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
    "from-orange-500/20 to-orange-600/20 border-orange-500/30",
    "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
  ];

  const iconColorMap = [
    "text-blue-400",
    "text-purple-400",
    "text-pink-400",
    "text-emerald-400",
    "text-orange-400",
    "text-cyan-400",
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything Built for Your Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Powerful tools designed to make continuing education flexible, compliant, and effortless for busy professionals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative group rounded-xl p-6 bg-gradient-to-br ${colorMap[index]} border backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className={`h-6 w-6 ${iconColorMap[index]}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
