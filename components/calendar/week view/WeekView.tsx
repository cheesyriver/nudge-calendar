'use client';

import { useMemo } from 'react';
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  startOfDay,
  endOfDay,
  differenceInMinutes,
  max,
  min,
} from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeClick: (date: Date) => void;
}

// Pixel height of each one-hour slot — single source of truth for all calculations
const HOUR_HEIGHT = 80;

// Pre-computed once at module level — avoids allocating Date objects on every render
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABELS = HOURS.map((h) => {
  if (h === 0) return '';
  return format(new Date(2000, 0, 1, h), 'h a');
});

export function WeekView({ currentDate, events, onTimeClick }: Readonly<WeekViewProps>) {
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate]);

  const handleSlotClick = (day: Date, hour: number) => {
    const clickedTime = new Date(day);
    clickedTime.setHours(hour, 0, 0, 0);
    onTimeClick(clickedTime);
  };

  return (
    <div className="flex flex-col h-170 bg-background overflow-hidden">
      {/* Header */}
      <div className="flex flex-none border-b border-(--border-color)">
        <div className="w-16 shrink-0" />
        <div className="grid flex-1 grid-cols-7 divide-x divide-(--border-color) border-l border-(--border-color) h-full">
          {weekDays.map((day) => (
            <div key={day.toString()} className="py-3 text-center flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-tight">
                {format(day, 'EEE')}
              </span>
              <span
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  isSameDay(day, new Date())
                    ? 'bg-(--accent-color) text-white'
                    : 'text-(--primary-text)',
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="flex-1 h-full">
        <div className="flex items-start pb-20">
          {/* Hours Column */}
          <div className="w-16 shrink-0 flex flex-col">
            {HOURS.map((hour) => (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-[10px] font-medium text-muted-foreground uppercase">
                  {HOUR_LABELS[hour]}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="grid flex-1 grid-cols-7 divide-x divide-(--border-color) border-l border-(--border-color)">
            {weekDays.map((day) => {
              const dayStart = startOfDay(day);
              const dayEnd = endOfDay(day);
              const dayEvents = events.filter((e) => e.start <= dayEnd && e.end >= dayStart);

              return (
                <div key={day.toString()} className="relative h-full min-h-480">
                  {/* Clickable hour slots */}
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleSlotClick(day, hour)}
                      aria-label={`Add event on ${format(day, 'EEEE')} at ${HOUR_LABELS[hour] || '12 AM'}`}
                      className="w-full block text-left border-b border-(--border-color) transition-colors hover:bg-(--opaque-color) focus-visible:bg-(--opaque-color) outline-none focus-visible:ring-2 ring-inset ring-(--accent-color)"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Absolutely positioned events */}
                  {dayEvents.map((event) => {
                    const visualStart = max([event.start, dayStart]);
                    const visualEnd = min([event.end, dayEnd]);

                    const top =
                      visualStart.getHours() * HOUR_HEIGHT +
                      (visualStart.getMinutes() / 60) * HOUR_HEIGHT;

                    const height =
                      (differenceInMinutes(visualEnd, visualStart) / 60) * HOUR_HEIGHT;

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded-md p-1.5 text-[10px] border shadow-sm transition-all hover:brightness-95 overflow-hidden',
                          event.color || 'bg-(--accent-color) text-white border-white/10',
                        )}
                        style={{ top, height: Math.max(height, 20), zIndex: 10 }}
                      >
                        <p className="font-bold truncate leading-tight">{event.title}</p>
                        {height > 40 && (
                          <p className="opacity-80 text-[9px] truncate">
                            {format(event.start, 'h:mm a')}
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
