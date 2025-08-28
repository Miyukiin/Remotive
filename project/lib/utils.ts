"use client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

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

export function useScreenWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    setWidth(window.innerWidth);

    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export type OverdueInfo = {
  isOverdue: boolean; // true if due date is before today (by whole days)
  isDueToday: boolean; // true if due date is today (calendar day)
  daysOverdue: number; // whole days overdue (0 if not overdue)
};

export function calculateOverdueInfo(dueInput: Date | null): OverdueInfo {
  if (!dueInput) return { isOverdue: false, daysOverdue: 0, isDueToday: false };

  const due = dueInput;
  if (isNaN(due.getTime())) return { isOverdue: false, daysOverdue: 0, isDueToday: false };

  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Helper func to strip the time off, so that we avoid off-by-hours bugs.
  const today = startOf(new Date());
  const dueDay = startOf(due);

  const MS_PER_DAY = 86_400_000;
  const diffMs = today.getTime() - dueDay.getTime(); // milliseconds difference
  const diffDays = Math.floor(diffMs / MS_PER_DAY); // whole-day difference

  return {
    isDueToday: diffDays === 0, // is Due Today
    isOverdue: diffDays > 0, // Overdue by how many days
    daysOverdue: diffDays > 0 ? diffDays : 0, // Due in |diffDays| days
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
    hexcolor =
      "#" +
      hexcolor[1] +
      hexcolor[1] +
      hexcolor[2] +
      hexcolor[2] +
      hexcolor[3] +
      hexcolor[3];
  }

  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const result: "black" | "white" = yiq >= 128 ? "black" : "white";

  return { result };
}

// Perform shallow comparison. Does not handle nested comparisons like for objects or arrays.
// To be used within update query utilities to identify changed fields to be updated.
// export function getDataDiff<T>(existingData: T, newData: T): Partial<T> {
//   const changed: Partial<T> = {};

//   for (const [key, oldValue] of Object.entries(existingData)) {
//     const newValue = (newData as any)[key];

//     if (oldValue !== newValue) {
//       (changed as any)[key] = newValue;
//     }
//   }

//   return changed;
// }
