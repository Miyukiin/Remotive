"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getTasksCompletion } from "@/lib/api-calls/api-calls-client";
import type { TasksCompletionChartPayload } from "@/types";

const chartConfig = {
  completed: { label: "Completed", color: "var(--chart-1)" },
  notCompleted: { label: "Not Completed", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function TasksCompletionChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasksCompletion"],
    queryFn: getTasksCompletion,
  });
  // Radial chart number of tasks completed vs number of tasks not completed across all projects assigned to the teams of user
  
  const { chartData, total, percentCompleted, subtitle } = useMemo(() => {
    const payload: TasksCompletionChartPayload | undefined = data?.success
      ? (data.data as TasksCompletionChartPayload)
      : undefined;

    const completed = payload?.completed ?? 0;
    const notCompleted = payload?.notCompleted ?? 0;
    const total = completed + notCompleted;
    const percentCompleted = total === 0 ? 0 : Math.round((completed / total) * 100);

    const chartData = [{ completed, notCompleted }];

    return {
      chartData,
      total,
      percentCompleted,
      subtitle: `Tasks ${percentCompleted}% completion across all your teams' projects`,
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Tasks Completion</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-6" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Tasks Completion</CardTitle>
          <CardDescription className="text-destructive">
            {(error as Error)?.message ?? "Failed to load"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-6" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Tasks Completion</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center pb-0">
        {/* https://ui.shadcn.com/charts/radial#charts stacked radial */}
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
          <RadialBarChart data={chartData} endAngle={180} innerRadius={80} outerRadius={130}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 16} className="fill-foreground text-2xl font-bold">
                          {percentCompleted}%
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 4} className="fill-muted-foreground">
                          Completed
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>

            <RadialBar
              dataKey="completed"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-completed)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="notCompleted"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-notCompleted)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">Total tasks: {total.toLocaleString()}</div>
      </CardFooter>
    </Card>
  );
}
