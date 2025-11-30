import { Shield, Users, Award, Star } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "150+",
    label: "Approved Courses",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Average Course Rating",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Compliance Rate",
  },
  {
    icon: Users,
    value: "50 States",
    label: "Regulatory Support",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-12 px-4 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10 mb-3">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
