'use client';

import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, format 
} from 'date-fns';
import { cn } from "@/lib/utils";

export function MonthView({ currentDate }: Readonly<{ currentDate: Date }>) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full">
      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Actual Day Grid */}
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-30 p-2 border-r border-b transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground/50"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center h-7 w-7 text-sm rounded-full",
                isToday && "bg-primary text-primary-foreground font-bold"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Event items would be mapped here */}
              <div className="mt-1 space-y-1">
                {/* Example Placeholder */}
                {isToday && (
                  <div className="text-[10px] bg-blue-100 text-blue-700 p-1 rounded border border-blue-200 truncate">
                    Check Firestore...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}