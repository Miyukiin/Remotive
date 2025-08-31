"use client";

import { Calendar as ReactBigCalendar, View, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { calendarDummyDates } from "@/lib/utils";


import { useCallback } from "react";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarProps = {
  view: View;
  setView: (val: View) => void;
  date: Date;
  setDate: (val: Date) => void;
};

export function Calendar({ view, setView, date, setDate }: CalendarProps) {
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);

  return (
    <div className="rbc-tailwind! w-full h-full rounded-md border">
      <ReactBigCalendar
        localizer={localizer}
        events={calendarDummyDates}
        startAccessor="start"
        endAccessor="end"
        date={date}
        onNavigate={onNavigate}
        view={view}
        onView={onView}
        views={["month", "week", "day"]}
        toolbar={false}
        style={{ height: "100%" }}
      />
    </div>
  );
}
