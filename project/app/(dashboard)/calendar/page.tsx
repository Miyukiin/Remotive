"use client";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/calendar/calendar";
import React, { useEffect, useState } from "react";
import { View } from "react-big-calendar";
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from "date-fns";
import { fetchCalendarEvents, fetchUpcomingDeadlines } from "@/actions/calendar-actions";
import { toast } from "sonner";
import { CalendarEvent, UpcomingDeadlineEvent } from "@/types";
import Link from "next/link";

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(now);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingDeadlineEvent[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  async function loadCalendarEvents() {
    const res = await fetchCalendarEvents();
    if (res.success) {
      // Dates already are Date objects — no spread, no rehydrate
      setCalendarEvents(res.data ?? []);
    } else {
      toast.error("Error", { description: "Unable to retrieve calendar events." });
    }
  }

  async function loadUpcoming() {
    setLoadingUpcoming(true);
    const res = await fetchUpcomingDeadlines();
    if (res.success) {
      setUpcomingEvents(res.data ?? []);
    } else {
      toast.error("Error", { description: "Unable to retrieve upcoming events." });
    }
    setLoadingUpcoming(false);
  }

  useEffect(() => {
    loadCalendarEvents();
    loadUpcoming();
  }, []);

  function onViewChange(next: View) {
    setView(next);
  }

  function goPrev() {
    setDate((d) => {
      if (view === "day") return addDays(d, -1);
      if (view === "week") return addWeeks(d, -1);
      return addMonths(d, -1);
    });
  }

  function goNext() {
    setDate((d) => {
      if (view === "day") return addDays(d, 1);
      if (view === "week") return addWeeks(d, 1);
      return addMonths(d, 1);
    });
  }

  function goToday() {
    setDate(new Date());
  }

  function formatCalendarDate(d: Date) {
    switch (view) {
      case "day": // Sunday, August 31
        return format(d, "EEEE, MMMM d");
      case "week": {
        const start = startOfWeek(d, { weekStartsOn: 0 }); // Sunday-start
        const end = endOfWeek(d, { weekStartsOn: 0 });
        return `${format(start, "MMMM d")} - ${format(end, "MMMM d")}`;
      }
      case "month": // August 2025
        return format(d, "MMMM yyyy");
      default:
        return "Invalid view";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-2">View project deadlines and team schedules</p>
        </div>
      </div>

      {/* Calendar Header + View */}
      <Card>
        <CardHeader className="flex flex-col items-center justify-between md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Previous" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <CardTitle className="text-xl">{formatCalendarDate(date)}</CardTitle>

            <Button variant="ghost" size="icon" aria-label="Next" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Button variant="outline" onClick={goToday}>
              Today
            </Button>
            <Tabs value={view} onValueChange={(v) => onViewChange(v as View)} className="w-fit">
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[600px] w-full rounded-md border bg-muted/40">
            <Calendar view={view} setView={setView} date={date} setDate={setDate} events={calendarEvents} />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>What’s coming up next</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingUpcoming ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-md border bg-card p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-muted" />
                    <div className="h-4 w-40 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="flex items-center justify-center rounded-md border bg-card p-6 text-muted-foreground gap-3">
              <CalendarDays className="h-5 w-5" />
              <span>No upcoming events.</span>
            </div>
          ) : (
            upcomingEvents.map((ev) => (
              <Link key={ev.id} href={`/projects/${ev.project_id}`} className="flex flex-col gap-3">
                <div key={ev.id} className="flex items-center justify-between rounded-md border bg-card p-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {ev.type === "Project" ? (
                      <Folder className="h-5 w-5 md:h-6 md:w-6 text-emerald-800 dark:text-primary shrink-0" />
                    ) : (
                      <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-emerald-800 dark:text-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{ev.title}</div>
                      <div className="mt-1">
                        <Badge variant="secondary" className="bg-white-smoke-100/70 dark:bg-dark-grey-50/40 w-fit">
                          {ev.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0">{format(ev.dueDate, "MMM d, yyyy")}</div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
