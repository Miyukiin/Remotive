"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LabelList, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getTeamTasksCountData } from "@/lib/api-calls/api-calls-client";
import { TeamTasksChartDataType, TeamTasksCountChartPayload } from "@/types";
import { COLOR_TOKENS } from "@/lib/utils";

export function TeamTasksChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["teamTasksCountChart"],
    queryFn: getTeamTasksCountData,
  });

  // Pie chart number of tasks for each team that the user belongs to for last 6 months 
  
  // Transform API → chart data
  const { chartData, chartConfig, dateLabel } = useMemo(() => {
    const payload: TeamTasksCountChartPayload | undefined = data?.success
      ? (data.data as TeamTasksCountChartPayload)
      : undefined;

    // Construct our chart data dynamically using the payload data
    const items = payload?.JsonSerializableTeamTasksData ?? [];
    const chartData: TeamTasksChartDataType[] = items.map((it, i) => ({
      team: it.teamName,
      tasks: it.taskCount,
      fill: COLOR_TOKENS[i % COLOR_TOKENS.length],
    }));

    // Dynamically build our config as to match labels with teams
    const dynamicEntries = Object.fromEntries(
      chartData.map((d, i) => [d.team, { label: d.team, color: COLOR_TOKENS[i % COLOR_TOKENS.length] }]),
    );

    // https://ui.shadcn.com/charts/pie#charts
    const chartConfig = {
      tasks: { label: "Tasks" },
      ...dynamicEntries,
    } as ChartConfig;

    const dateLabel = payload != null ? `${payload.sixMonthsAgo} – ${payload.month}` : "Last 6 months";

    return { chartData, chartConfig, dateLabel };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Tasks per Team</CardTitle>
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
          <CardTitle>Tasks per Team</CardTitle>
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
        <CardTitle>Tasks per Team</CardTitle>
        <CardDescription>{dateLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="tasks" hideLabel />} />
            <Pie data={chartData} dataKey="tasks" nameKey="team">
              <LabelList
                dataKey="team"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: unknown) =>
                  chartConfig[String(value) as keyof typeof chartConfig]?.label ?? String(value)
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">Showing tasks created in the last 6 months per team</div>
      </CardFooter>
    </Card>
  );
}
