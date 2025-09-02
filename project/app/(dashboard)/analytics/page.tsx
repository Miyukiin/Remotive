"use client";

import { TeamTasksChart } from "@/components/analytics/team-tasks-chart";
import { MonthTasksChart } from "@/components/analytics/month-tasks-chart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track project performance and team productivity</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamTasksChart />

        <MonthTasksChart />
      </div>
    </div>
  );
}
