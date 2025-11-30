import { Shield, Users, Award, Star } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "150+",
    label: "Approved Courses",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Student Rating",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Compliance Verified",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Active Learners",
    color: "from-emerald-500 to-emerald-600",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group rounded-xl p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} mb-4 text-white shadow-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
