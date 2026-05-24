'use client';

import { useMemo } from 'react';
import {
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

interface DayViewProps {
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

export function DayView({ currentDate, events, onTimeClick }: Readonly<DayViewProps>) {
  const dayStart = useMemo(() => startOfDay(currentDate), [currentDate]);
  const dayEnd = useMemo(() => endOfDay(currentDate), [currentDate]);

  const dayEvents = useMemo(
    () => events.filter((e) => e.start <= dayEnd && e.end >= dayStart),
    [events, dayStart, dayEnd],
  );

  const handleSlotClick = (hour: number) => {
    const clickedTime = new Date(currentDate);
    clickedTime.setHours(hour, 0, 0, 0);
    onTimeClick(clickedTime);
  };

  return (
    <div className="flex flex-col h-170 bg-background overflow-hidden border rounded-xl border-(--border-color)">
      {/* Header */}
      <div className="flex flex-none border-b p-4 items-center justify-between border-(--border-color)">
        <div className="flex flex-col text-left">
          <h2 className="text-lg font-bold text-(--primary-text)">
            {format(currentDate, 'EEEE')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, 'MMMM do, yyyy')}
          </p>
        </div>

        {isSameDay(currentDate, new Date()) && (
          <span className="px-3 py-1 rounded-full bg-(--accent-color) text-white text-xs font-bold">
            Today
          </span>
        )}
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="flex-1 w-full h-full overflow-y-auto">
        <div className="flex items-start">
          {/* Hours Column */}
          <div className="w-20 shrink-0 flex flex-col">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-r border-(--border-color)"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-3 text-[11px] font-semibold text-muted-foreground uppercase">
                  {HOUR_LABELS[hour]}
                </span>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative flex-1 h-full min-h-480">
            {/* Clickable hour slots */}
            {HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => handleSlotClick(hour)}
                aria-label={`Add event at ${HOUR_LABELS[hour] || '12 AM'}`}
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

              const height = (differenceInMinutes(visualEnd, visualStart) / 60) * HOUR_HEIGHT;

              return (
                <div
                  key={event.id}
                  className={cn(
                    'absolute left-4 right-10 rounded-lg p-4 border shadow-md transition-all',
                    event.color || 'bg-(--accent-color) text-white border-white/10',
                  )}
                  style={{ top, height: Math.max(height, 20), zIndex: 10 }}
                >
                  <div className="flex justify-between items-start overflow-hidden">
                    <p className="font-bold text-sm sm:text-base truncate leading-tight">
                      {event.title}
                    </p>
                    <span className="text-xs opacity-80 uppercase ml-2 whitespace-nowrap">
                      {format(event.start, 'h:mm a')} – {format(event.end, 'h:mm a')}
                    </span>
                  </div>

                  {height > 50 && (
                    <p className="text-xs mt-1 opacity-80 line-clamp-1">
                      {isSameDay(event.start, event.end) ? 'Single Day Event' : 'Multi-day Event'}
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
