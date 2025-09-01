import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { getRecentTasks } from "@/lib/api-calls/api-calls";
import { formatDate, cn, listColor } from "@/lib/utils";
import type { RecentTasks } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default async function RecentTasksCard() {
  const res = await getRecentTasks();

  if (!res.success) {
    return (
      <Card className="flex-1">
        <CardContent className="flex h-full items-center justify-center text-center text-muted-foreground">
          <p>Unable to load data.</p>
        </CardContent>
      </Card>
    );
  }

  const tasks = (res.data ?? []) as RecentTasks[];

  if (tasks.length === 0) {
    return (
      <Card className="flex-1 items-center">
        <CardContent className="flex h-full items-center justify-center text-center text-muted-foreground">
          <p>No tasks found.</p>
          <p>Get assigned to or create one.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {tasks.map((task) => {
          return (
            <Link href={`/projects/${task.project_id}`} key={task.id} className="group">
              <div className="rounded-md border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium leading-none">{task.title}</h4>
                    {task.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
                    ) : null}

                    <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <Users className="mr-1 h-4 w-4" aria-hidden="true" />
                          {task.assigneeCount}
                        </span>
                        <span className="inline-flex items-center">
                          <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
                          {task.dueDate ? formatDate(task.dueDate) : "No due date."}
                        </span>
                      </div>

                      <Badge variant="outline" className={cn("capitalize", listColor[task.statusColor])}>
                        {String(task.statusName).replace(/[_-]/g, " ")}
                      </Badge>
                    </div>

                    {/* Assignees */}
                    <div className="mt-3 flex -space-x-2">
                      {task.assigneeImages.map((img, index) => (
                        <Avatar key={index} className={`h-6 w-6`}>
                          <AvatarImage src={img} alt="User" />
                          <AvatarFallback>
                            <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
                          </AvatarFallback>
                        </Avatar>
                      ))}
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
