import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { queries } from "@/lib/db/queries/queries";
import { UserSelect } from "@/types";
import { listColor } from "@/lib/utils";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });

    const res = await queries.users.getByClerkId(user.id);
    if (!res.success) return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });

    const userId = res.data.id;

    const result = await db
      .select()
      .from(schema.tasks)
      .innerJoin(schema.users_to_tasks, eq(schema.users_to_tasks.task_id, schema.tasks.id))
      .where(eq(schema.users_to_tasks.user_id, userId))
      .orderBy(sql`${schema.tasks.createdAt} desc `)
      .limit(3);

    const tasks = result.map((row) => row.tasks);

    // Retrieve task assignees count
    const taskAssigneesResults: UserSelect[][] = await Promise.all(
      tasks.map(async (t) => {
        const res = await queries.tasks.getTaskMembers(t.id);
        return res.success ? res.data : [];
      }),
    );

    // Retrieve parent list name and color as status

    const taskStatus = new Map<number, { name: string; color: keyof typeof listColor }>();
    const taskProjectId = new Map<number, number>();
    for (const task of tasks) {
      const [res] = await db.select().from(schema.lists).where(eq(schema.lists.id, task.listId)).limit(1);
      if (res) {
        taskStatus.set(task.id, { name: res.name, color: res.color });
        taskProjectId.set(task.id, res.projectId);
      }
    }

    // Get only needed fields
    const tasksData = tasks.map((task, idx) => ({
      id: task.id,
      title: task.title,
      project_id: taskProjectId.get(task.id),
      description: task.description,
      dueDate: task.dueDate,
      statusName: taskStatus.get(task.id)?.name,
      statusColor: taskStatus.get(task.id)?.color,
      assigneeCount: taskAssigneesResults[idx].length,
      assigneeImages: taskAssigneesResults[idx].map((tm) => tm.image_url),
    }));

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved user recent tasks",
      data: tasksData ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent tasks",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
