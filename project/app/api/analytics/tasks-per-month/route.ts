import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { queries } from "@/lib/db/queries/queries";
import { and, eq, inArray, gte, lt } from "drizzle-orm";
import { startOfMonth, subMonths, addMonths, eachMonthOfInterval, format } from "date-fns";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const userRes = await queries.users.getByClerkId(user.id);
    if (!userRes.success) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    const userId = userRes.data.id;

    // Our window will last 6 full months including current month
    const startOfCurMonth = startOfMonth(new Date()); // For exampel e.g., Sep 1, 00:00.
    const startOfWindow = subMonths(startOfCurMonth, 5);  // 6 full months
    const startOfNextMonth = addMonths(startOfCurMonth, 1);  // next month

    // get Teams of current user
    const teamsRes = await queries.teams.getTeamsForUser(userId);
    if (!teamsRes.success) throw new Error("Unable to retrieve user teams.");
    const teamIds = teamsRes.data.map((t) => t.id);

    // get Members in those teams
    const members = teamIds.length
      ? await db
          .select({ userId: schema.users_to_teams.user_id })
          .from(schema.users_to_teams)
          .where(inArray(schema.users_to_teams.team_id, teamIds))
      : [];
    const memberIds = Array.from(new Set(members.map((m) => m.userId))); // dedupe also since it may be a member is part of two teams and we do not want to count twice

    // Pre-build month buckets (zeros)
    const monthStarts = eachMonthOfInterval({ start: startOfWindow, end: startOfCurMonth }); // 6 items, array of months within our window
    const bucket = new Map<string, number>(); // 2025-04 : 28 
    for (const d of monthStarts) bucket.set(formatKey(d), 0);

    // Fetch all tasks in window for those members
    const tasks = await db
      .select({ createdAt: schema.tasks.createdAt })
      .from(schema.tasks)
      .innerJoin(schema.users_to_tasks, eq(schema.users_to_tasks.task_id, schema.tasks.id))
      .where(
        and(
          inArray(schema.users_to_tasks.user_id, memberIds),
          gte(schema.tasks.createdAt, startOfWindow),
          lt(schema.tasks.createdAt, startOfNextMonth)
        )
      );

    // Tally into month buckets
    for (const t of tasks) {
      const key = formatKey(t.createdAt);
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }

    // Build our data points in order of motnhs
    const points = monthStarts.map((d) => ({
      month: formatMonth(d), 
      count: bucket.get(formatKey(d)) ?? 0,
    }));

    const labelRange = `${points[0].month} – ${points[points.length - 1].month}`;
    return NextResponse.json({ success: true, data: { labelRange, points } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch tasks-per-month", error: String(error) },
      { status: 500 }
    );
  }
}

function formatMonth(d: Date) {
  return format(d, "MMM yyyy"); //. Apr 2025
}
function formatKey(d: Date) {
  return format(d, "yyyy-MM"); // 2025-04
}
