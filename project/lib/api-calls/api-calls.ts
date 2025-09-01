import { DashboardAnalytics, RecentProjects, RecentTasks } from "@/types";
import { cookies } from "next/headers";
// Server only api calls

// Development
const API_BASE_URL = "http://localhost:3000/api/";

type APIResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      message: string;
      error: Error;
    };

export async function getRecentProjects() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const route = "projects/recent-projects/";
    const res = await fetch(API_BASE_URL + route, { method: "GET", headers: { Cookie: cookieHeader } });
    return (await res.json()) as APIResponse<RecentProjects[]>;
  } catch (e) {
    console.error("Error fetching recent projects:", e);
    throw e;
  }
}

export async function getRecentTasks() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const route = "tasks/recent-tasks/";
    const res = await fetch(API_BASE_URL + route, { method: "GET", headers: { Cookie: cookieHeader } });
    return (await res.json()) as APIResponse<RecentTasks[]>;
  } catch (e) {
    console.error("Error fetching recent tasks:", e);
    throw e;
  }
}

export async function getDashboardAnalytics() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const route = "dashboard/analytics/";
    const res = await fetch(API_BASE_URL + route, { method: "GET", headers: { Cookie: cookieHeader } });
    return (await res.json()) as APIResponse<DashboardAnalytics>;
  } catch (e) {
    console.error("Error fetching dashboard analytics:", e);
    throw e;
  }
}
