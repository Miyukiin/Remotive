"use client";

import { ProjectProgressPayload, TasksCompletionChartPayload, TasksPerMonthChartPayload, TeamTasksCountChartPayload } from "@/types";

// Development
const API_BASE_URL = "http://localhost:3000/api/";

type APIResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error?: unknown };

export async function getProjectProgress(project_id: number) {
  try {
    const route = `projects/${project_id}/progress/`;
    const res = await fetch(API_BASE_URL + route, {
      method: "GET",
      credentials: "include", // send cookies for Clerk-protected routes
      cache: "no-store", // always fresh
    });
    return (await res.json()) as APIResponse<ProjectProgressPayload>;
  } catch (e) {
    console.error("Error fetching project progress:", e);
    throw e;
  }
}

export async function getTeamTasksCountData() {
  try {
    const route = `analytics/team-tasks/`;
    const res = await fetch(API_BASE_URL + route, {
      method: "GET",
      credentials: "include", // send cookies for Clerk-protected routes
      cache: "no-store", // always fresh
    });
    return (await res.json()) as APIResponse<TeamTasksCountChartPayload>;
  } catch (e) {
    console.error("Error fetching team tasks count:", e);
    throw e;
  }
}

export async function getTasksPerMonth() {
  try {
    const route = `analytics/tasks-per-month/`;
    const res = await fetch(API_BASE_URL + route, {
      method: "GET",
      credentials: "include", // send cookies for Clerk-protected routes
      cache: "no-store", // always fresh
    });
    return (await res.json()) as APIResponse<TasksPerMonthChartPayload>;
  } catch (e) {
    console.error("Error fetching tasks per month:", e);
    throw e;
  }
}

export async function getTasksCompletion() {
  try {
    const route = `analytics/tasks-completion/`;
    const res = await fetch(API_BASE_URL + route, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    return (await res.json()) as APIResponse<TasksCompletionChartPayload>;
  } catch (e) {
    console.error("Error fetching tasks completion:", e);
    throw e;
  }
}
