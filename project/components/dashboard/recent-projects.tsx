import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { getRecentProjects } from "@/lib/api-calls/api-calls";
import { projectStatusColor, formatDate, cn } from "@/lib/utils";
import type { RecentProjects } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function RecentProjectsCard() {
  const res = await getRecentProjects();

  if (!res.success) {
    return (
      <Card className="flex-1  items-center gap-2">
        <CardContent className="flex flex-col text-sm h-full items-center justify-center text-center text-muted-foreground">
          <p>Unable to load data.</p>
        </CardContent>
      </Card>
    );
  }

  const projects = (res.data ?? []) as RecentProjects[];

  if (projects.length === 0) {
    return (
      <Card className="flex-1  items-center gap-2">
        <CardContent className="flex flex-col text-sm h-full items-center justify-center text-center text-muted-foreground">
          <p className="font-bold text-md">No projects found.</p>
          <p className="text-xs">Get invited to or create one.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/projects" className="text-sm font-medium text-emerald-400 hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {projects.map((project) => {
          const pct = project.percentCompletion;

          return (
            <Link href={`/projects/${project.id}`} key={project.id} className="group">
              <div className="rounded-md border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium leading-none">{project.name}</h4>
                    {project.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    ) : null}

                    <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <Users className="mr-1 h-4 w-4" aria-hidden="true" />
                          {project.memberCount}
                        </span>
                        <span className="inline-flex items-center">
                          <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
                          {project.dueDate ? formatDate(project.dueDate) : "No due date."}
                        </span>
                      </div>

                      <Badge variant="outline" className={cn("capitalize", projectStatusColor[project.status])}>
                        {String(project.status).replace(/[_-]/g, " ")}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
