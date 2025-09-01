import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { queries } from "@/lib/db/queries/queries";

function pctDelta(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? "+100%" : "0%"; 
  const pct = ((curr - prev) / prev) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    

    // Get our internal user.id
    const userRes = await queries.users.getByClerkId(user.id);
    if (!userRes.success) return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });
    
    const userId = userRes.data.id;

    // Time windows for deltas
    const now = new Date();
    const last7 = new Date(now);
    last7.setDate(now.getDate() - 7);
    const prev14 = new Date(now);
    prev14.setDate(now.getDate() - 14);

    // Projects the user belongs to (via project_members) 
    const myMemberships = await db
      .select({
        projectId: schema.project_members.project_id,
        createdAt: schema.project_members.createdAt, 
      })
      .from(schema.project_members)
      .where(eq(schema.project_members.user_id, userId));

    const projectIds = [...new Set(myMemberships.map(m => m.projectId))];
    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Successfully retrieved user dashboard analytics data.",
        data: {
          stats: { activeProjects: 0, teamMembers: 0, completedTasks: 0, pendingTasks: 0 },
          deltas: { activeProjects: "0%", teamMembers: "0%", completedTasks: "0%", pendingTasks: "0%" },
        },
      });
    }

    // Snapshot: active projects
    const activeProjects = projectIds.length;

    // Delta for active projects: when user joined projects
    const joinedLast7 = myMemberships.filter(m => m.createdAt >= last7 && m.createdAt <= now).length;
    const joinedPrev7 = myMemberships.filter(m => m.createdAt >= prev14 && m.createdAt < last7).length; // any members joined Period between the 14th day, and 7th day

    // Team members across those projects (unique, exclude self ofcousre)
    const memberRows = await db
      .select({
        userId: schema.project_members.user_id,
        projectId: schema.project_members.project_id,
        createdAt: schema.project_members.createdAt,
      })
      .from(schema.project_members)
      .where(inArray(schema.project_members.project_id, projectIds));

    const uniqueMemberIds = new Set(memberRows.map(r => r.userId));
    uniqueMemberIds.delete(userId);
    const teamMembers = uniqueMemberIds.size;

    const addedMembersLast7 = new Set(
      memberRows.filter(r => r.userId !== userId && r.createdAt >= last7 && r.createdAt <= now).map(r => r.userId)
    ).size;
    const addedMembersPrev7 = new Set(
      memberRows.filter(r => r.userId !== userId && r.createdAt >= prev14 && r.createdAt < last7).map(r => r.userId)
    ).size;

    // Lists for those projects list.isDone equals completed task
    const listRows = await db
      .select({
        id: schema.lists.id,
        projectId: schema.lists.projectId, 
        isDone: schema.lists.isDone,
      })
      .from(schema.lists)
      .where(inArray(schema.lists.projectId, projectIds as number[]));

    const listInfoById = new Map<number, { projectId: number; isDone: boolean }>();
    for (const l of listRows) listInfoById.set(l.id, { projectId: l.projectId, isDone: l.isDone });

    const listIds = listRows.map(l => l.id);

    // Tasks in those lists
    let completedTasks = 0;
    let pendingTasks = 0;
    let completedLast7 = 0;
    let completedPrev7 = 0;
    let pendingCreatedLast7 = 0;
    let pendingCreatedPrev7 = 0;

    if (listIds.length > 0) {
      const taskRows = await db
        .select({
          id: schema.tasks.id,
          listId: schema.tasks.listId,      
          createdAt: schema.tasks.createdAt,
          updatedAt: schema.tasks.updatedAt,
        })
        .from(schema.tasks)
        .where(inArray(schema.tasks.listId, listIds as number[]));

      for (const t of taskRows) {
        const info = listInfoById.get(t.listId);
        if (!info) continue;

        const isCompletedNow = info.isDone; 

        if (isCompletedNow) {
          completedTasks++;
          // Use updatedAt as a proxy for "moved to Done" for the delta windows because we dont have an attribute or something to tell us when moved to Done occurred
          if (t.updatedAt >= last7 && t.updatedAt <= now) completedLast7++;
          else if (t.updatedAt >= prev14 && t.updatedAt < last7) completedPrev7++;
        } else {
          pendingTasks++;
          // Pending delta: tasks created in window and still pending
          if (t.createdAt >= last7 && t.createdAt <= now) pendingCreatedLast7++;
          else if (t.createdAt >= prev14 && t.createdAt < last7) pendingCreatedPrev7++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved user dashboard analytics data.",
      data: {
        stats: {
          activeProjects,
          teamMembers,
          completedTasks,
          pendingTasks,
        },
        deltas: {
          activeProjects: pctDelta(joinedLast7, joinedPrev7),
          teamMembers: pctDelta(addedMembersLast7, addedMembersPrev7),
          completedTasks: pctDelta(completedLast7, completedPrev7),
          pendingTasks: pctDelta(pendingCreatedLast7, pendingCreatedPrev7),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user dashboard analytics data.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
