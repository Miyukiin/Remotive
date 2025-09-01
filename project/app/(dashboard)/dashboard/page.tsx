import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/dashboard/dashboard-stats-skeleton";
import RecentProjects from "@/components/dashboard/recent-projects";
import { RecentProjectsCardSkeleton } from "@/components/dashboard/recent-projects-skeleton";
import RecentTasks from "@/components/dashboard/recent-tasks";
import { RecentTasksCardSkeleton } from "@/components/dashboard/recent-tasks-skeleton";

import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s an overview of your projects and tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Recent Activity */}
      <div className="flex flex-col md:flex-row w-full gap-6">
        {/* Recent Projects + Recent Tasks column */}
        <div className="flex flex-1 flex-col gap-6">
          <Suspense fallback={<RecentProjectsCardSkeleton />}>
            <RecentProjects />
          </Suspense>

          <Suspense fallback={<RecentTasksCardSkeleton />}>
            <RecentTasks />
          </Suspense>
        </div>

        {/* Feed */}
        <div className="flex flex-1 h-full bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Feed</h3>
          <div className="space-y-3" />
        </div>
      </div>
    </div>
  );
}
