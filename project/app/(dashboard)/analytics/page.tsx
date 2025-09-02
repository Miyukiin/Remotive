"use client";

import { TrendingUp} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTasksChart } from "@/components/analytics/team-tasks-chart";



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

        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Events & contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 grid place-items-center rounded-md border bg-muted/40">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="mx-auto mb-2 h-12 w-12" />
                <p>Activity Chart Placeholder</p>
                <p className="text-sm">TODO: Implement activity timeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
