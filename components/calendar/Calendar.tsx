'use client';

import { useCallback, useState } from 'react';
import { addMonths, addWeeks, addDays, startOfToday, addHours } from 'date-fns';
import { CalendarTop } from './CalendarTop';
import { MonthView } from './month view/MonthView';
import { WeekView } from './week view/WeekView';
import { DayView } from './day view/DayView';
import { EventModal } from './EventModal';
import { CalendarEvent, ViewType } from './types';

const DEFAULT_EVENT_COLOR = 'bg-(--accent-color) border-none text-white';

export function Calendar() {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Chemistry Study',
      start: new Date(2026, 4, 29, 8, 0),
      end: new Date(2026, 4, 29, 10, 30),
      color: 'bg-(--accent-color) border-none',
    },
    {
      id: '2',
      title: 'Final Project Hackathon',
      start: new Date(2026, 4, 26, 12, 30),
      end: new Date(2026, 4, 26, 15, 30),
      color: 'bg-emerald-500 border-none',
    },
    {
      id: '3',
      title: "Hailee's birthday party",
      start: new Date(2026, 4, 13, 18, 30),
      end: new Date(2026, 4, 13, 23, 59),
      color: 'bg-(--accent-color) border-none',
    },
  ]);

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') return addMonths(prev, -1);
      if (view === 'week') return addWeeks(prev, -1);
      return addDays(prev, -1);
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'month') return addMonths(prev, 1);
      if (view === 'week') return addWeeks(prev, 1);
      return addDays(prev, 1);
    });
  }, [view]);

  const handleToday = useCallback(() => setCurrentDate(startOfToday()), []);

  const handleOpenAddModal = useCallback((start?: Date) => {
    const startTime = start ?? new Date();
    setSelectedSlot({ start: startTime, end: addHours(startTime, 1) });
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = useCallback((title: string, start: Date, end: Date) => {
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        start,
        end,
        color: DEFAULT_EVENT_COLOR,
      },
    ]);
    setIsModalOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl border border-(--primary-text) rounded-xl overflow-hidden bg-background shadow-sm">
      <CalendarTop
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onAddEvent={handleOpenAddModal}
      />

      <div className="flex-1 min-h-0">
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onDateClick={handleOpenAddModal}
          />
        )}

        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onTimeClick={handleOpenAddModal}
          />
        )}

        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            events={events}
            onTimeClick={handleOpenAddModal}
          />
        )}
      </div>

      {/* Modal sits at the root level — outside the scrollable content div — so
          fixed positioning always works regardless of any parent overflow. */}
      {isModalOpen && selectedSlot && (
        <EventModal
          initialStart={selectedSlot.start}
          initialEnd={selectedSlot.end}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
