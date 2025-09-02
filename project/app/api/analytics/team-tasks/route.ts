import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { queries } from "@/lib/db/queries/queries";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, inArray, gte } from "drizzle-orm";

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

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    // We will return these later as part of the return object
    const nowMonth = new Date().toLocaleString("default", { month: "long" });
    const sixMonthsAgoMonth = sixMonthsAgo.toLocaleString("default", { month: "long" });

    // Retrieve tasks count per team
    const res = await queries.teams.getTeamsForUser(userId);
    if (!res.success) throw new Error("Unable to retrieve user teams.");

    const userTeamIds = res.data.map((t) => t.id);

    // Retrieve task count per team
    const teamTaskCountMap = new Map<number, { teamName: string; taskCount: number }>(); // Team ID : Task Count
    for (const teamId of userTeamIds) {
      // Retrieve all user ids that are members of the team
      const members = await db
        .select({ member_id: schema.users_to_teams.user_id })
        .from(schema.users_to_teams)
        .where(eq(schema.users_to_teams.team_id, teamId));

      // Unwrap {member_id: number}[] => number[]
      const memberIds = members.map((m) => m.member_id);

      // From these entries, select only those whose user_ids are part of the team, and only for the past six months
      const tasks = await db
        .select({ task: schema.tasks })
        .from(schema.tasks)
        .innerJoin(schema.users_to_tasks, eq(schema.users_to_tasks.task_id, schema.tasks.id))
        .where(and(inArray(schema.users_to_tasks.user_id, memberIds), gte(schema.tasks.createdAt, sixMonthsAgo)));

      const taskCount = tasks.length;

      // Retrieve the name of the team
      const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, teamId));

      teamTaskCountMap.set(teamId, { teamName: team.teamName, taskCount });
    }

    const JsonSerializableTeamTasksData = [];

    for (const [teamId, value] of teamTaskCountMap) {
      JsonSerializableTeamTasksData.push({
        teamId,
        teamName: value.teamName,
        taskCount: value.taskCount,
      });
    }

    const payload = {
      month: nowMonth,
      sixMonthsAgo: sixMonthsAgoMonth,
      JsonSerializableTeamTasksData,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team tasks count.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
