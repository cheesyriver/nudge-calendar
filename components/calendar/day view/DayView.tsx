'use client';

import { 
  format, 
  isSameDay, 
  startOfDay,
  endOfDay,
  differenceInMinutes,
  max,
  min
} from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { CalendarEvent } from '../month view/Day';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export function DayView({ currentDate, events }: Readonly<DayViewProps>) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayStart = startOfDay(currentDate);
  const dayEnd = endOfDay(currentDate);

  // Filter events that overlap with this specific day
  const dayEvents = events.filter(e => {
    return e.start <= dayEnd && e.end >= dayStart;
  });

  return (
    <div className="flex flex-col h-170 bg-background overflow-hidden border rounded-xl border-(--border-color)">
      
      {/* 1. Header */}
      <div className="flex flex-none border-b p-4 items-center justify-between border-(--border-color)">
        <div className="flex flex-col text-left">
          <h2 className="text-lg font-bold text-(--primary-text)">
            {format(currentDate, "EEEE")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, "MMMM do, yyyy")}
          </p>
        </div>
        
        {isSameDay(currentDate, new Date()) && (
          <span className="px-3 py-1 rounded-full bg-(--accent-color) text-white text-xs font-bold">
            Today
          </span>
        )}
      </div>

      {/* 2. Scrollable Body */}
      <ScrollArea className="flex-1 w-full h-full overflow-y-auto">
        <div className="flex items-start">
          
          {/* Hours Column */}
          <div className="w-20 shrink-0 flex flex-col">
            {hours.map((hour) => (
              <div key={hour} className="h-20 relative border-r border-(--border-color)">
                <span className="absolute -top-2 right-3 text-[11px] font-semibold text-muted-foreground uppercase">
                  {hour === 0 ? "" : format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Detailed Grid */}
          <div className="relative flex-1 h-full min-h-480">
            {/* Background Grid Lines */}
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-20 border-b transition-colors hover:bg-(--opaque-color)"
                style={{ borderColor: 'var(--border-color)' }}
              />
            ))}

            {/* Absolute Positioned Events */}
            {dayEvents.map((event) => {
              // Stops Events going off page (Clamp)
              const visualStart = max([event.start, dayStart]);
              const visualEnd = min([event.end, dayEnd]);

              // Calculate Top offset based on clamped start
              const startHour = visualStart.getHours();
              const startMinutes = visualStart.getMinutes();
              const top = (startHour * 80) + (startMinutes / 60 * 80);
              
              // Calculate Height based on clamped duration
              const durationInMinutes = differenceInMinutes(visualEnd, visualStart);
              const height = (durationInMinutes / 60) * 80;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-4 right-10 rounded-lg p-4 border shadow-md transition-all",
                    event.color || "bg-(--accent-color) text-white border-white/10"
                  )}
                  style={{ 
                    top: `${top}px`, 
                    height: `${height}px`,
                    minHeight: '20px',
                    zIndex: 10 
                  }}
                >
                  <div className="flex justify-between items-start overflow-hidden">
                    <p className="font-bold text-sm sm:text-base truncate leading-tight">
                      {event.title}
                    </p>
                    <span className="text-xs opacity-80 uppercase ml-2 whitespace-nowrap">
                      {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                    </span>
                  </div>
                  
                  {/* Event details - only shows if block is tall enough */}
                  {height > 50 && (
                    <p className="text-xs mt-1 opacity-80 line-clamp-1">
                      {isSameDay(event.start, event.end) 
                        ? "Single Day Event" 
                        : "Multi-day Event"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}