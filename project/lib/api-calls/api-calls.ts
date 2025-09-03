import { DashboardAnalytics, DashboardFeedItem, RecentProjects, RecentTasks } from "@/types";
import { cookies } from "next/headers";
// Server only api calls

const API_BASE_URL = process.env.API_URL!;

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

export async function getDashboardFeed() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const route = `audit/recent/`;
    const res = await fetch(API_BASE_URL + route, {
      method: "GET",
      headers: { Cookie: cookieHeader },
    });
    return (await res.json()) as APIResponse<DashboardFeedItem[]>;
  } catch (e) {
    console.error("Error fetching dashboard feed:", e);
    throw e;
  }
}
