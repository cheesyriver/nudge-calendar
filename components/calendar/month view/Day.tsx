"use client";

import { useMemo } from "react";
import { isToday, startOfDay, format, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "../types";

interface DayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onClick: (date: Date) => void;
}

const MAX_VISIBLE_EVENTS = 2;

export function Day({
  date,
  isCurrentMonth,
  events,
  onClick,
}: Readonly<DayProps>) {
  const dayEvents = useMemo(() => {
    const dayStart = startOfDay(date);

    return events
      .filter((event) => {
        const eventStart = startOfDay(event.start);
        const eventEnd = startOfDay(event.end);
        return isWithinInterval(dayStart, { start: eventStart, end: eventEnd });
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [events, date]);

  const extraEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS;
  const today = isToday(date);

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      className={cn(
        "group relative flex h-32 flex-col items-stretch p-1 transition-all outline-none",
        "border-r nth-[7n]:border-r-0",
        "border-b nth-last-[-n+7]:border-b-0",
        "hover:cursor-pointer",
        isCurrentMonth ? "bg-background" : "bg-(--base-variant)",
      )}
    >
      {/* Day Number */}
      <div className="mb-1 flex justify-start">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
            // Highlight today's number with the accent colour
            today && isCurrentMonth
              ? "bg-(--accent-color) font-bold text-white"
              : isCurrentMonth
                ? "text-(--primary-text)"
                : "text-[--secondary-text] opacity-30",
          )}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Events List */}
      <div className="flex w-full flex-col gap-1 overflow-hidden text-left">
        {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
          <div
            key={event.id}
            className={cn(
              "w-full truncate rounded border px-2 py-0.5 text-[10px] shadow-sm sm:text-xs",
              event.color,
              !isCurrentMonth && "opacity-50",
            )}
          >
            {event.title}
          </div>
        ))}

        {extraEventsCount > 0 && (
          <p className="px-1 text-[10px] font-semibold text-(--secondary-text) opacity-60">
            + {extraEventsCount} more
          </p>
        )}
      </div>

      {/* Today border indicator — kept as a secondary signal alongside the number highlight */}
      {today && isCurrentMonth && (
        <div className="pointer-events-none absolute inset-0 border-2 border-(--accent-color)" />
      )}
    </button>
  );
}
