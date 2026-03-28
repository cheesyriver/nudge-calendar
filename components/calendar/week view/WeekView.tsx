'use client';

import { 
  startOfWeek, 
  addDays, 
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

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export function WeekView({ currentDate, events }: Readonly<WeekViewProps>) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-170 bg-background overflow-hidden">
      
      {/* 1. Header */}
      <div className="flex flex-none border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="w-16 shrink-0" /> 
        <div 
          className="grid flex-1 grid-cols-7 divide-x border-l h-full" 
          style={{ borderColor: 'var(--border-color)'}}
        >
          {weekDays.map((day) => (
            <div key={day.toString()} className="py-3 text-center flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-tight">
                {format(day, "EEE")}
              </span>
              <span className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isSameDay(day, new Date()) 
                  ? "bg-(--accent-color) text-white" 
                  : "text-(--primary-text)"
              )}>
                {format(day, "d")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <ScrollArea className="flex-1 h-full">
        <div className="flex items-start pb-20">
          
          {/* Hours Column */}
          <div className="w-16 shrink-0 flex flex-col">
            {hours.map((hour) => (
              <div key={hour} className="h-20 relative">
                <span className="absolute -top-2 right-2 text-[10px] font-medium text-muted-foreground uppercase">
                  {hour === 0 ? "" : format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Grid View */}
          <div 
            className="grid flex-1 grid-cols-7 divide-x border-l" 
            style={{ borderColor: 'var(--border-color)'}}
          >
            {weekDays.map((day) => {
              const dayStart = startOfDay(day);
              const dayEnd = endOfDay(day);

              // Filter events that overlap with this specific day of the week
              const dayEvents = events.filter(e => e.start <= dayEnd && e.end >= dayStart);
              
              return (
                <div key={day.toString()} className="relative h-full min-h-480">
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

                    const startHour = visualStart.getHours();
                    const startMinutes = visualStart.getMinutes();
                    const top = (startHour * 80) + (startMinutes / 60 * 80);

                    const durationInMinutes = differenceInMinutes(visualEnd, visualStart);
                    const height = (durationInMinutes / 60) * 80;

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "absolute left-0.5 right-0.5 rounded-md p-1.5 text-[10px] border shadow-sm transition-all hover:brightness-95 overflow-hidden",
                          event.color || "bg-(--accent-color) text-white border-white/10"
                        )}
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`, 
                          minHeight: '20px',
                          zIndex: 10 
                        }}
                      >
                        <p className="font-bold truncate leading-tight">{event.title}</p>
                        {height > 40 && (
                           <p className="opacity-80 text-[9px] truncate">
                             {format(event.start, "h:mm a")}
                           </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}