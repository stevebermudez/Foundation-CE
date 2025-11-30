import { Card, CardContent } from "@/components/ui/card";
import {
  Video,
  FileText,
  TimerOff,
  Award,
  Shield,
  Smartphone,
  Clock,
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
    title: "Comprehensive PDF Guides",
    description:
      "Downloadable study materials and guides for each course to reference anytime.",
  },
  {
    icon: TimerOff,
    title: "No-Timer Option",
    description:
      "Take exams at your own pace with our compliant no-timer option for stress-free testing.",
  },
  {
    icon: Clock,
    title: "Timed Exams Available",
    description:
      "Traditional timed exam options for those who prefer structured testing environments.",
  },
  {
    icon: Shield,
    title: "State Approved",
    description:
      "All courses are approved by DRE (California) and FREC (Florida) for CE credit.",
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
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Everything You Need to Stay Compliant
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed with busy professionals in mind, offering flexible learning options modeled after industry leaders like First Tuesday and Better CE.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-elevate">
              <CardContent className="pt-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
