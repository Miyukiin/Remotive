"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/calendar/calendar";
import React, { useState } from "react";
import { View } from "react-big-calendar";
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from "date-fns";

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(now);

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
            <Calendar view={view} setView={setView} date={date} setDate={setDate} />
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
          {[
            { title: "Website Redesign", date: "Dec 15, 2024", type: "Project Deadline" },
            { title: "Team Meeting", date: "Dec 18, 2024", type: "Meeting" },
            { title: "Mobile App Launch", date: "Dec 22, 2024", type: "Milestone" },
          ].map((event, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-md border bg-card p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{event.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="w-fit">
                    {event.type}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground shrink-0">{event.date}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
