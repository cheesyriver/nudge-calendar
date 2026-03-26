'use client';

import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  startOfDay 
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
                  {hour === 0 ? "" : format(new Date().setHours(hour), "h a")}
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
              const dayEvents = events.filter(e => isSameDay(startOfDay(e.start), day));
              
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
                    const startHour = event.start.getHours();
                    const startMinutes = event.start.getMinutes();
                    const top = (startHour * 80) + (startMinutes / 60 * 80);

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-md p-2 text-xs border shadow-sm transition-all hover:brightness-95",
                          event.color || "bg-(--accent-color) text-white border-white/10"
                        )}
                        style={{ 
                          top: `${top}px`, 
                          height: '60px', 
                          zIndex: 10 
                        }}
                      >
                        <p className="font-bold truncate leading-tight">{event.title}</p>
                        <p className="opacity-80 text-[10px]">{format(event.start, "h:mm a")}</p>
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