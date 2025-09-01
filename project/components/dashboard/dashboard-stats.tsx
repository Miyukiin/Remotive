import { CheckCircle, Clock, TrendingUp, Users } from "lucide-react";

import type { DashboardAnalytics } from "@/types";
import { getDashboardAnalytics } from "@/lib/api-calls";

const FALLBACK: DashboardAnalytics = {
  stats: { activeProjects: 0, teamMembers: 0, completedTasks: 0, pendingTasks: 0 },
  deltas: { activeProjects: "0%", teamMembers: "0%", completedTasks: "0%", pendingTasks: "0%" },
};

const WINDOW_LABEL = "(Last 7 days)";

export async function DashboardStats() {
  const res = await getDashboardAnalytics();
  const data: DashboardAnalytics = res && res.success ? res.data : FALLBACK;

  const cards = [
    {
      name: "Active Projects",
      value: String(data.stats.activeProjects),
      icon: TrendingUp,
      change: data.deltas.activeProjects,
    },
    { name: "Team Members", value: String(data.stats.teamMembers), icon: Users, change: data.deltas.teamMembers },
    {
      name: "Completed Tasks",
      value: String(data.stats.completedTasks),
      icon: CheckCircle,
      change: data.deltas.completedTasks,
    },
    { name: "Pending Tasks", value: String(data.stats.pendingTasks), icon: Clock, change: data.deltas.pendingTasks },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => {
        const trimmed = stat.change?.trim() ?? "0%";
        const isPositive = trimmed.startsWith("+");
        const isZero = trimmed === "0%" || trimmed === "+0%" || trimmed === "-0%";
        const color = isZero
          ? "text-muted-foreground"
          : isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400";

        return (
          <div key={stat.name} className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-200 rounded-lg flex items-center justify-center">
                  <stat.icon className="text-emerald-600" size={20} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-foreground truncate">
                    <span>{stat.name}</span>
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{WINDOW_LABEL}</span>
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                    <div className={`ml-2 text-sm font-medium ${color}`}>{trimmed}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
