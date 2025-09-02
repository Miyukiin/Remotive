import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { queries } from "@/lib/db/queries/queries";
import { UserSelect } from "@/types";

export type RecentProjects = {
  id: number;
  name: string;
  description: string | null;
  dueDate: Date | null;
  updatedAt: Date;
  status: "Completed" | "On-hold" | "In Progress" | "Planning" | "Review";
  percentCompletion: number;
  memberCount: number;
  memberImages: string[];
};

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });

    const res = await queries.users.getByClerkId(user.id);
    if (!res.success) return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });

    const userId = res.data.id;

    const result = await db
      .select()
      .from(schema.projects)
      .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.project_id, schema.projects.id))
      .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.team_id, schema.teams_to_projects.team_id))
      .where(eq(schema.users_to_teams.user_id, userId))
      .orderBy(sql`${schema.projects.createdAt} desc `)
      .limit(3);

    const projects = result.map((row) => row.projects);

    // Deduplicate
    const projectIds = Array.from(new Set(projects.map((project) => project.id)));
    const uniqueProjects = projectIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p) => p !== undefined) as typeof projects;

    // Retrieve team member count
    const teamMembersResults: UserSelect[][] = await Promise.all(
      uniqueProjects.map(async (p) => {
        const res = await queries.projects.getAllMembersForProject(p.id);
        return res.success ? res.data : [];
      }),
    );

    // project progress completion ---
    // Count tasks whose list is marked as Done (lists.isDone = true) versus tasks in lists not marked as done.

    // get every list that belongs to the 3 projects returned
    const listsRows =
      projectIds.length === 0
        ? []
        : await db
            .select({
              id: schema.lists.id,
              projectId: schema.lists.projectId,
              isDone: schema.lists.isDone,
            })
            .from(schema.lists)
            .where(inArray(schema.lists.projectId, projectIds));

    const allListIds = listsRows.map((l) => l.id);
    // This will store a map to look up which project a list belongs to and whether that list is “Done”.
    const listInfoById = new Map<number, { projectId: number; isDone: boolean }>();
    for (const l of listsRows) {
      listInfoById.set(l.id, { projectId: l.projectId, isDone: l.isDone });
    }

    // Retrieve which listids, and thus which project, each task belongs to
    const taskRows =
      allListIds.length === 0
        ? []
        : await db
            .select({
              id: schema.tasks.id,
              listId: schema.tasks.listId,
            })
            .from(schema.tasks)
            .where(inArray(schema.tasks.listId, allListIds));

    const progressMap = new Map<number, { total: number; done: number }>();
    for (const t of taskRows) {
      const info = listInfoById.get(t.listId); // find its project through task's list
      if (!info) continue;
      const prev = progressMap.get(info.projectId) ?? { total: 0, done: 0 }; // Retrieve previous progress state of this project
      // Increment for this task, checking whether this task is in the done list or not
      const next = {
        total: prev.total + 1,
        done: prev.done + (info.isDone ? 1 : 0),
      };
      // Update the projectid's progress with the incremented value
      progressMap.set(info.projectId, next);
    }

    // Get only needed fields
    const projectsData: RecentProjects[] = uniqueProjects.map((project, idx) => {
      const members = teamMembersResults[idx] ?? [];
      const counts = progressMap.get(project.id) ?? { total: 0, done: 0 };
      const percent = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        dueDate: project.dueDate,
        updatedAt: project.updatedAt,
        status: project.status,
        memberCount: members.length,
        memberImages: members.map((tm) => tm.image_url),
        percentCompletion: percent,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved user recent projects",
      data: projectsData ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent projects.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
