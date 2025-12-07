import { Shield, Clock, Award, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "State",
    label: "Approved Provider",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Online Access",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: CheckCircle,
    value: "Instant",
    label: "Certificate Delivery",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    value: "FREC",
    label: "Approved Courses",
    color: "from-pink-500 to-pink-600",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-6 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-white/10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              data-testid={`stat-card-${index}`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
