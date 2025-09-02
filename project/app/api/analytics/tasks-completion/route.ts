import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { queries } from "@/lib/db/queries/queries";
import { inArray } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const userRes = await queries.users.getByClerkId(user.id);
    if (!userRes.success) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    const userId = userRes.data.id;

    // get Teams of current user
    const teamsRes = await queries.teams.getTeamsForUser(userId);
    if (!teamsRes.success) throw new Error("Unable to retrieve user teams.");
    const teamIds = teamsRes.data.map((t) => t.id);
    if (teamIds.length === 0) {
      // because it is possible for a user to not have a team yet.
      return NextResponse.json({
        success: true,
        message: "OK",
        data: { total: 0, completed: 0, notCompleted: 0, percentCompleted: 0 },
      });
    }

    // get Projects linked to those teams
    const teamProjects = await db
      .select({ projectId: schema.teams_to_projects.project_id })
      .from(schema.teams_to_projects)
      .where(inArray(schema.teams_to_projects.team_id, teamIds));

    const projectIds = Array.from(new Set(teamProjects.map((p) => p.projectId)));
    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "OK",
        data: { total: 0, completed: 0, notCompleted: 0, percentCompleted: 0 },
      });
    }

    // Lists for those projects (id + isDone)
    const lists = await db
      .select({ id: schema.lists.id, isDone: schema.lists.isDone })
      .from(schema.lists)
      .where(inArray(schema.lists.projectId, projectIds));

    if (lists.length === 0) {
      // It may be that a project does not have a list.
      return NextResponse.json({
        success: true,
        message: "OK",
        data: { total: 0, completed: 0, notCompleted: 0, percentCompleted: 0 },
      });
    }

    const listIds = lists.map((l) => l.id);
    const isDoneByListId = new Map(lists.map((l) => [l.id, l.isDone]));

    // get Tasks under those lists
    const tasks = await db
      .select({ id: schema.tasks.id, listId: schema.tasks.listId })
      .from(schema.tasks)
      .where(inArray(schema.tasks.listId, listIds));

    // Count completed vs not completed based on their parent list
    let total = 0;
    let completed = 0;
    for (const t of tasks) {
      total += 1;
      if (isDoneByListId.get(t.listId)) completed += 1;
    }
    const notCompleted = total - completed;
    const percentCompleted = total === 0 ? 0 : Math.round((completed / total) * 100);

    return NextResponse.json({
      success: true,
      message: "OK",
      data: { total, completed, notCompleted, percentCompleted },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks completion", error: String(error) },
      { status: 500 },
    );
  }
}
