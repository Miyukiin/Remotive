import { queries } from "@/lib/db/queries/queries";
import { keepForDashboard } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { desc, eq, aliasedTable, inArray, or } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    }

    // Resolve internal user id
    const userRes = await queries.users.getByClerkId(user.id);
    if (!userRes.success) {
      return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });
    }
    const userId = userRes.data.id;

    // IDs of teams/projects the user belongs to
    const myTeams = await db
      .select({ teamId: schema.users_to_teams.team_id })
      .from(schema.users_to_teams)
      .where(eq(schema.users_to_teams.user_id, userId));

    const myProjects = await db
      .select({ projectId: schema.project_members.project_id })
      .from(schema.project_members)
      .where(eq(schema.project_members.user_id, userId));

    const myTeamIds = myTeams.map((t) => t.teamId);
    const myProjectIds = myProjects.map((p) => p.projectId);

    // If the user belongs to nothing, nothing is pertinent
    if (myTeamIds.length === 0 && myProjectIds.length === 0) {
      return NextResponse.json(
        { success: true, message: "Successfully retrieved dashboard feed", data: [] },
        { status: 200 },
      );
    }

    const a = schema.auditLogs;
    const actor = aliasedTable(schema.users, "actor");
    const subject = aliasedTable(schema.users, "subject");

    // Only get rows where user is a member of
    const teamFilter = myTeamIds.length ? inArray(a.team_id, myTeamIds) : undefined;
    const projectFilter = myProjectIds.length ? inArray(a.project_id, myProjectIds) : undefined;
    const membershipWhere = teamFilter && projectFilter ? or(teamFilter, projectFilter) : (teamFilter ?? projectFilter); // use both filters if both exists else just use wihch one is present.

    const rows = await db
      .select({
        id: a.id,
        action: a.action,
        createdAt: a.created_at,

        actorName: actor.name,
        actorImage: actor.image_url,
        subjectName: subject.name,
        subjectImage: subject.image_url,

        projectName: schema.projects.name,
        teamName: schema.teams.teamName,
        listName: schema.lists.name,
        taskTitle: schema.tasks.title,
      })
      .from(a)
      .leftJoin(actor, eq(actor.id, a.actor_user_id))
      .leftJoin(subject, eq(subject.id, a.subject_user_id))
      .leftJoin(schema.projects, eq(schema.projects.id, a.project_id))
      .leftJoin(schema.teams, eq(schema.teams.id, a.team_id))
      .leftJoin(schema.lists, eq(schema.lists.id, a.list_id))
      .leftJoin(schema.tasks, eq(schema.tasks.id, a.task_id))
      .where(membershipWhere)
      .orderBy(desc(a.created_at))
      .limit(15);

    const items = rows
      .filter((r) => keepForDashboard(r.action))
      .map((r) => ({
        id: r.id,
        action: r.action,
        createdAt: r.createdAt,

        actorName: r.actorName,
        actorImage: r.actorImage,
        subjectName: r.subjectName,
        subjectImage: r.subjectImage,

        projectName: r.projectName,
        teamName: r.teamName,
        listName: r.listName,
        taskTitle: r.taskTitle,
      }));

    return NextResponse.json(
      { success: true, message: "Successfully retrieved dashboard feed", data: items },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user dashboard feed.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
