'use client';

import React, { useMemo } from 'react';
import { isToday, isSameDay, startOfDay, format } from 'date-fns';
import { cn } from "@/lib/utils";

// Types for events - adjust based future firebase schema - DONT FORGET
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  color?: string;
}

interface DayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onClick: (date: Date) => void;
}

const MAX_VISIBLE_EVENTS = 2;

export function Day({ date, isCurrentMonth, events, onClick }: Readonly<DayProps>) {
  // Filter events for this specific day
  const dayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(startOfDay(event.start), startOfDay(date)));
  }, [events, date]);

  const extraEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS;

  return (
    <button type="button" onClick={() => onClick(date)} className={cn("group relative flex flex-col items-stretch h-32 p-1 transition-all outline-none", "border-r nth-[7n]:border-r-0", "border-b nth-last-[-n+7]:border-b-0", "hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary", isCurrentMonth ? "text-foreground":"text-gray-500")}>
      {/* Day Number */}
      <div className="flex justify-start mb-1">
        <span
          className={cn(
            "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors",
            isToday(date) 
              ? "bg-primary text-primary-foreground font-bold" 
              : "group-hover:bg-muted"
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-1 overflow-hidden text-left w-full">
        {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
          <div
            key={event.id}
            className={cn(
              "px-2 py-0.5 text-[10px] sm:text-xs rounded border truncate w-full shadow-sm",
              event.color || "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            )}
          >
            {event.title}
          </div>
        ))}

        {extraEventsCount > 0 && (
          <p className="px-1 text-[10px] font-semibold text-muted-foreground mt-0.5">
            + {extraEventsCount} more
          </p>
        )}
      </div>

      {/* Visual Indicator for Current Day */}
      {isToday(date) && (
        <div className="absolute inset-0 border-2 border-primary/10" />
      )}
    </button>
  );
}