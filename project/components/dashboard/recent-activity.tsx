import type { DashboardFeedItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getDashboardFeed } from "@/lib/api-calls/api-calls";

export default async function RecentActivities() {
  const res = await getDashboardFeed();

  if (!res.success) {
    return (
      <Card className="flex-1">
        <CardContent className="flex h-full items-center justify-center text-center text-muted-foreground">
          <p>Unable to load feed.</p>
        </CardContent>
      </Card>
    );
  }

  const items = (res.data ?? []) as DashboardFeedItem[];

  if (items.length === 0) {
    return (
      <Card className="flex-1 items-center">
        <CardContent className="flex h-full items-center justify-center text-center text-muted-foreground">
          <p>No activity yet.</p>
          <p>Once you and your team start working, feed items will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {items.map((i) => {
          const dateText = format(new Date(i.createdAt), "EEEE, MMM d, yyyy");

          return (
            <div key={i.id} className="rounded-md border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                {/* Actor Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={i.actorImage ?? ""} alt={i.actorName ?? "User"} />
                  <AvatarFallback>{(i.actorName ?? "U")[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="text-sm">
                    <Badge variant="secondary" className="mr-1">
                      {i.actorName ?? "Someone"}
                    </Badge>
                    {renderSentence(i)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">On {dateText}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* Subject badge */
function NameBadge({ name, image }: { name: string | null; image: string | null }) {
  const safe = (name ?? "a member").trim();
  const initials =
    safe
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <Badge variant="secondary" className="inline-flex items-center gap-2 pl-1 pr-2 py-1 align-middle">
      <Avatar className="h-4 w-4">
        <AvatarImage src={image ?? ""} alt={safe} />
        <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-xs">{safe}</span>
    </Badge>
  );
}

/* Tag badge for entities*/
function TagBadge({ label, fallback }: { label: string | null; fallback: string }) {
  return (
    <>
      {fallback}
      <Badge variant="outline" className=" ml-1 align-middle">
        {label ?? fallback}
      </Badge>
    </>
  );
}

function renderSentence(i: DashboardFeedItem) {
  const subject = i.subjectName ? (
    <NameBadge name={i.subjectName} image={i.subjectImage} />
  ) : (
    <Badge variant="outline">a member</Badge>
  );

  const project = <TagBadge label={i.projectName} fallback="project" />;
  const team = <TagBadge label={i.teamName} fallback="team" />;
  const list = <TagBadge label={i.listName} fallback="list" />;
  const task = <TagBadge label={i.taskTitle} fallback="task" />;

  switch (i.action) {
    // TEAMS
    case "TEAM_CREATED":
      return <> created {team}</>;
    case "TEAM_UPDATED":
      return <> updated {team}</>;
    case "TEAM_DELETED":
      return <> deleted {team}</>;
    case "TEAM_MEMBER_ADDED":
      return (
        <>
          {" "}
          added {subject} to {team}
        </>
      );
    case "TEAM_MEMBER_REMOVED":
      return (
        <>
          {" "}
          removed {subject} from {team}
        </>
      );
    case "TEAM_LEADER_REASSIGNED":
      return (
        <>
          {" "}
          reassigned team leader to {subject} in {team}
        </>
      );

    // PROJECTS
    case "PROJECT_CREATED":
      return <> created {project}</>;
    case "PROJECT_UPDATED":
      return <> updated {project}</>;
    case "PROJECT_DELETED":
      return <> deleted {project}</>;
    case "PROJECT_TEAM_ADDED":
      return (
        <>
          {" "}
          added {team} to {project}
        </>
      );
    case "PROJECT_TEAM_REMOVED":
      return (
        <>
          {" "}
          removed {team} from {project}
        </>
      );
    case "PROJECT_MEMBER_ADDED":
      return (
        <>
          {" "}
          added {subject} to {project}
        </>
      );
    case "PROJECT_MEMBER_REMOVED":
      return (
        <>
          {" "}
          removed {subject} from {project}
        </>
      );
    case "PROJECT_MEMBER_ROLE_UPDATED":
      return (
        <>
          {" "}
          updated {subject}
          {"'"}s role in {project}
        </>
      );

    // LISTS
    case "LIST_CREATED":
      return (
        <>
          {" "}
          created {list} in {project}
        </>
      );
    case "LIST_UPDATED":
      return (
        <>
          {" "}
          updated {list} in {project}
        </>
      );
    case "LIST_DELETED":
      return (
        <>
          {" "}
          deleted {list} in {project}
        </>
      );
    case "LIST_MOVED":
      return (
        <>
          {" "}
          moved {list} in {project}
        </>
      );

    // COMMENTS
    case "COMMENT_CREATED":
      return (
        <>
          {" "}
          left a comment on {task} in {project}
        </>
      );
    case "COMMENT_UPDATED":
      return (
        <>
          {" "}
          updated a comment on {task} in {project}
        </>
      );
    case "COMMENT_DELETED":
      return (
        <>
          {" "}
          deleted a comment on {task} in {project}
        </>
      );

    // TASKS
    case "TASK_CREATED":
      return (
        <>
          {" "}
          created {task} in {project}
        </>
      );
    case "TASK_UPDATED":
      return (
        <>
          {" "}
          updated {task} in {project}
        </>
      );
    case "TASK_DELETED":
      return (
        <>
          {" "}
          deleted {task} in {project}
        </>
      );
    case "TASK_MOVED":
      return (
        <>
          {" "}
          moved {task} in {project}
        </>
      );
    case "TASK_MEMBER_ASSIGNED":
      return (
        <>
          {" "}
          assigned {subject} to {task}
        </>
      );
    case "TASK_MEMBER_REMOVED":
      return (
        <>
          {" "}
          removed {subject} from {task}
        </>
      );

    default:
      return <> {i.action.toLowerCase().replaceAll("_", " ")}</>;
  }
}
