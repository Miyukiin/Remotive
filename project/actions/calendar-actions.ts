"use server";

import { CalendarEvent, UpcomingDeadlineEvent } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { checkAuthenticationStatus } from "./actions-utils";
import { getUserId } from "./user-actions";
import { queries } from "@/lib/db/queries/queries";
import { failResponse, successResponse } from "@/lib/db/queries/query_utils";

// Fetch eventData
export async function fetchCalendarEvents(): Promise<ServerActionResponse<CalendarEvent[]>> {
  try {
    await checkAuthenticationStatus();

    const res = await getUserId();
    if (!res.success) throw new Error("Unable to retrieve user.");

    const user_id = res.data.id;

    const calendarEvents: CalendarEvent[] = [];

    // Fetch user projects
    const result = await queries.projects.getProjectsForUser(user_id);
    if (!result.success) throw new Error(result.message);

    const userProjects = result.data;

    // Add to calendarEvents if dueDate is not null
    userProjects.forEach((p) => {
      if (p.dueDate) {
        calendarEvents.push({
          id: p.ownerId,
          title: p.name,
          start: p.createdAt,
          end: p.dueDate,
        });
      }
    });

    // Fetch user tasks
    const response = await queries.tasks.getUserTasks(user_id);
    if (!response.success) throw new Error(response.message);

    const userTasks = response.data;
    const OFFSET = 10000;

    // Add to calendarEvents if dueDate is not null
    userTasks.forEach((t) => {
      if (t.dueDate) {
        calendarEvents.push({
          id: t.id + OFFSET,
          title: t.title,
          start: t.createdAt,
          end: t.dueDate,
        });
      }
    });

    return successResponse("Successfully retrieved user calendar events", calendarEvents);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : (e as string);
    return failResponse(errorMessage, e);
  }
}

// Fetch upcoming deadlines
export async function fetchUpcomingDeadlines(): Promise<ServerActionResponse<UpcomingDeadlineEvent[]>> {
  try {
    await checkAuthenticationStatus();

    const res = await getUserId();
    if (!res.success) throw new Error("Unable to retrieve user.");

    const user_id = res.data.id;

    const upcomingDeadlineEvents: UpcomingDeadlineEvent[] = [];

    // Fetch user projects
    const result = await queries.projects.getProjectsForUser(user_id);
    if (!result.success) throw new Error(result.message);

    const userProjects = result.data;

    // Add if dueDate is not null
    userProjects.forEach((p) => {
      if (p.dueDate) {
        upcomingDeadlineEvents.push({
          id: p.ownerId,
          project_id: p.id,
          title: p.name,
          type: "Project",
          dueDate: p.dueDate,
        });
      }
    });

    // Fetch user tasks
    const response = await queries.tasks.getUserTasks(user_id);
    if (!response.success) throw new Error(response.message);

    const userTasks = response.data;
    const OFFSET = 10000;

    // Map returns a promise, which is resolved all at the same time,
    const taskEvents = await Promise.all(
      userTasks
        .filter((t) => !!t.dueDate)
        .map(async (t) => {
          const res = await queries.lists.getById(t.listId);
          if (!res.success) throw new Error(res.message);
          return {
            id: t.id + OFFSET,
            project_id: res.data.projectId,
            title: t.title,
            type: "Task" as const,
            dueDate: t.dueDate!,
          };
        }),
    );

    upcomingDeadlineEvents.push(...taskEvents);

    return successResponse("Successfully retrieved user upcoming deadline events.", upcomingDeadlineEvents);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : (e as string);
    return failResponse(errorMessage, e);
  }
}
