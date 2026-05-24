'use client';

import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns';
import { Day } from './Day';
import { CalendarEvent } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}

// Constant outside the component — created once, never re-allocated on re-renders
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function MonthView({ currentDate, events, onDateClick }: Readonly<MonthViewProps>) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-hidden">
        {days.map((date) => (
          <Day
            key={date.toISOString()}
            date={date}
            isCurrentMonth={isSameMonth(date, monthStart)}
            events={events}
            onClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}
