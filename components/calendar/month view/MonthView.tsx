'use client';

import { 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth 
} from 'date-fns';
import { Day, CalendarEvent } from './Day';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}

export function MonthView({ currentDate, events, onDateClick }: Readonly<MonthViewProps>) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
  <div className="flex flex-col h-full bg-background select-none">
    {/* Weekday Labels: Only bottom border to separate from grid */}
    <div className="grid grid-cols-7 border-b bg-muted/20">
      {weekDays.map((day) => (
        <div 
          key={day} 
          className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest border-r last:border-r-0"
        >
          {day}
        </div>
      ))}
    </div>

    {/* The Grid: No outer borders here, let DayCell handle internal lines */}
    <div className="grid grid-cols-7 flex-1 overflow-hidden">
      {days.map((date, index) => (
        <Day
          key={date.toISOString()}
          date={date}
          // Pass index to help handle the last column if needed
          isCurrentMonth={isSameMonth(date, monthStart)}
          events={events}
          onClick={onDateClick}
        />
      ))}
    </div>
  </div>
  );
}