'use client';

import { useMemo } from 'react';
import { isToday, startOfDay, format, isWithinInterval } from 'date-fns';
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
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
  // Checks if the current date is between the start and end of the event
  const dayEvents = useMemo(() => {
    const dayStart = startOfDay(date);
    
    return events.filter((event) => {
      const eventStart = startOfDay(event.start);
      const eventEnd = startOfDay(event.end);

      return isWithinInterval(dayStart, { 
        start: eventStart, 
        end: eventEnd 
      });
    });
  }, [events, date]);

  const extraEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS;

  return (
    <button 
      type="button" 
      onClick={() => onClick(date)} 
      className={cn(
        "group relative flex flex-col items-stretch h-32 p-1 transition-all outline-none", 
        "border-r nth-[7n]:border-r-0", 
        "border-b nth-last-[-n+7]:border-b-0", 
        "hover:cursor-pointer",
        isCurrentMonth ? "bg-background" : "bg-(--base-variant)"
      )}
    >
      {/* Day Number */}
      <div className="flex justify-start mb-1">
        <span className={cn(
          "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors", 
          isCurrentMonth ? "text-(--primary-text)" : "text-(--secondary-text) opacity-30"
        )}>
          {format(date, 'd')}
        </span>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-1 overflow-hidden text-left w-full">
        {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => {
          
          return (
            <div
              key={event.id}
              className={cn(
                "px-2 py-0.5 text-[10px] sm:text-xs border truncate w-full shadow-sm",
                "rounded",
                event.color,
                !isCurrentMonth && "opacity-50"
              )}
            >
              {event.title}
            </div>
          );
        })}

        {extraEventsCount > 0 && (
          <p className="px-1 text-[10px] font-semibold text-(--secondary-text) opacity-60">
            + {extraEventsCount} more
          </p>
        )}
      </div>

      {/* Visual Indicator for Current Day */}
      {isToday(date) && isCurrentMonth && (
        <div className="absolute inset-0 border-2 border-(--accent-color) pointer-events-none" />
      )}
    </button>
  );
}

// Helper needed for the mapping check
function isSameDay(d1: Date, d2: Date) {
  return d1.getTime() === d2.getTime();
}