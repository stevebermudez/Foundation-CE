import { Shield, Clock, Award, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Award,
    label: "Florida FREC Approved",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Clock,
    label: "Study Anytime, Anywhere",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: CheckCircle,
    label: "Instant Certificates",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    label: "Secure Checkout",
    color: "from-pink-500 to-pink-600",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-4 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-white/10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
              data-testid={`stat-card-${index}`}
            >
              <stat.icon className={`h-4 w-4 text-green-400`} />
              <span className="text-sm text-white/90">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
