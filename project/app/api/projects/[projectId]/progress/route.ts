import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { queries } from "@/lib/db/queries/queries";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });

  // Get our internal user.id
  const userRes = await queries.users.getByClerkId(user.id);
  if (!userRes.success)
    return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });

  const projectId = Number(params.projectId);
  if (projectId <= 0) {
    return NextResponse.json({ success: false, message: "Invalid project id" }, { status: 400 });
  }

  // get Lists for this project
  const lists = await db
    .select({ id: schema.lists.id, isDone: schema.lists.isDone })
    .from(schema.lists)
    .where(eq(schema.lists.projectId, projectId));

  if (lists.length === 0) {
    return NextResponse.json({
      success: true,
      message: "OK",
      data: { total: 0, done: 0, percent: 0 },
    });
  }

  const listIds = lists.map((l) => l.id);
  const isDoneByListId = new Map(lists.map((l) => [l.id, l.isDone]));

  // get Tasks under those lists
  const tasks = await db
    .select({ id: schema.tasks.id, listId: schema.tasks.listId })
    .from(schema.tasks)
    .where(inArray(schema.tasks.listId, listIds));

  // retrieve total and done tasks by checking each task's listid isDone  value
  let total = 0;
  let done = 0;
  for (const t of tasks) {
    total += 1;
    if (isDoneByListId.get(t.listId)) done += 1;
  }

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return NextResponse.json({
    success: true,
    message: "OK",
    data: { total, done, percent },
  });
}
