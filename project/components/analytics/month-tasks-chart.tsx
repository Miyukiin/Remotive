"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { TasksPerMonthChartPayload } from "@/types";
import { getTasksPerMonth } from "@/lib/api-calls/api-calls-client";

const chartConfig: ChartConfig = {
  count: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
};

export function MonthTasksChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasksPerMonth"],
    queryFn: getTasksPerMonth,
  });

  // Area chart for number of tasks per month for last 6 months for all teams of user

  const { points, labelRange } = useMemo(() => {
    const payload: TasksPerMonthChartPayload | undefined =
      data?.success ? (data.data as TasksPerMonthChartPayload) : undefined;

    return {
      points: payload?.points ?? [],
      labelRange: payload?.labelRange ?? "Last 6 months",
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks created per Month</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent className="h-40" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks created per Month</CardTitle>
          <CardDescription className="text-destructive">
            {(error as Error)?.message ?? "Failed to load"}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-40" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks created per Month</CardTitle>
        <CardDescription>{labelRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={points} // [{ month: "Apr 2025", count: 12 }, ...]
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent nameKey="count" indicator="line" />} />
            <Area
              dataKey="count"
              type="natural"
              stroke="var(--color-count)"
              fill="var(--color-count)"
              fillOpacity={0.35}
              dot={{ r: 3 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Number of tasks created across all teams in the past 6 months.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
