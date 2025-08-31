import RecentProjectsCard from "@/components/projects/recent-projects";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CheckCircle, Clock, Plus, Loader2Icon } from "lucide-react";
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

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Active Projects", value: "12", icon: TrendingUp, change: "+2.5%" },
          { name: "Team Members", value: "24", icon: Users, change: "+4.1%" },
          { name: "Completed Tasks", value: "156", icon: CheckCircle, change: "+12.3%" },
          { name: "Pending Tasks", value: "43", icon: Clock, change: "-2.1%" },
        ].map((stat) => {
          const isPositive = stat.change.startsWith("+");
          return (
            <div key={stat.name} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-200 rounded-lg flex items-center justify-center">
                    <stat.icon className="text-emerald-600" size={20} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-foreground truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                      <div
                        className={`ml-2 text-sm font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} `}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-x-2 bg-card rounded-lg border border-border p-6">
              <Loader2Icon size={24} className="animate-spin text-muted-foreground" />
              <p className="text-base text-muted-foreground"> Loading </p>
            </div>
          }
        >
          {" "}
          <RecentProjectsCard />
        </Suspense>

        {/* Quick Actions */}
        <div className=" bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="default" className="bg-emerald-500 hover:bg-emerald-400 w-full flex items-center justify-center px-4 py-3 ">
              <Plus size={20} className="mr-2" />
              Create New Project
            </Button>
            <Button variant="secondary" className="w-full flex items-center justify-center px-4 py-3 ">
              <Plus size={20} className="mr-2" />
              Add Team Member
            </Button>
            <Button variant="secondary" className="w-full flex items-center justify-center px-4 py-3 ">
              <Plus size={20} className="mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
