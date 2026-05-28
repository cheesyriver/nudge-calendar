'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { addMonths, addWeeks, addDays, startOfToday, addHours } from 'date-fns';
import { CalendarTop } from './CalendarTop';
import { MonthView } from './month view/MonthView';
import { WeekView } from './week view/WeekView';
import { DayView } from './day view/DayView';
import { EventModal } from './EventModal';
import { CalendarEvent, ViewType } from './types';
import { generateSampleSchedule } from './SampleSchedule';
import { AssignmentModal, AssignmentDetails } from './AssignmentModal';
import { GraduationCap } from 'lucide-react';

const STORAGE_KEY = 'calendar-events';

const EVENT_COLORS = [
  'bg-(--accent-color) border-none text-white',
  'bg-emerald-500 border-none text-white',
] as const;

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Chemistry Study',
    start: new Date(2026, 2, 26, 8, 0),
    end: new Date(2026, 2, 26, 10, 30),
    color: 'bg-(--accent-color) border-none',
  },
  {
    id: '2',
    title: 'Final Project Hackathon',
    start: new Date(2026, 2, 26, 12, 30),
    end: new Date(2026, 2, 26, 15, 30),
    color: 'bg-emerald-500 border-none',
  },
  {
    id: '3',
    title: 'Final Project Hackathon',
    start: new Date(2026, 2, 26, 18, 30),
    end: new Date(2026, 2, 26, 23, 59),
    color: 'bg-(--accent-color) border-none',
  },
];

export function Calendar() {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);

  const isFirstRender = useRef(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEvents(
          parsed.map((e: CalendarEvent) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          })),
        );
      }
    } catch {
      // localStorage unavailable or corrupted — keep sample events.
    }
  }, []);

  // Persist whenever events change, skipping the initial SAMPLE_EVENTS render.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

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
        color: EVENT_COLORS[prev.length % EVENT_COLORS.length],
      },
    ]);
    setIsModalOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleScheduleAssignment = useCallback(async (details: AssignmentDetails) => {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignment: details,
        existingEvents: events.map((e) => ({
          title: e.title,
          start: new Date(e.start).toISOString(),
          end: new Date(e.end).toISOString(),
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Request failed with status ${res.status}`);
    }

    const { studySlots } = await res.json();

    const newEvents: CalendarEvent[] = studySlots.map((slot: { title: string; start: string; end: string }) => ({
      id: crypto.randomUUID(),
      title: slot.title,
      start: new Date(slot.start),
      end: new Date(slot.end),
      color: 'bg-sky-500 border-none text-white',
    }));

    setEvents((prev) => [...prev, ...newEvents]);
    setIsAssignmentModalOpen(false);

    if (newEvents.length > 0) {
      setCurrentDate(newEvents[0].start);
    }
  }, [events]);

  const handleImportSchedule = useCallback(() => {
  const schedule = generateSampleSchedule();
  setEvents((prev) => {
    const scheduleIds = new Set(schedule.map((e) => e.id));
    // Keep any events not in the sample schedule (e.g. AI-added study sessions)
    const kept = prev.filter((e) => !scheduleIds.has(e.id));
    const merged = [...kept, ...schedule];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  });
}, []);

  return (
    <div className="w-full h-full px-3 sm:px-0">
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto border border-(--primary-text) rounded-xl overflow-hidden bg-background shadow-sm">
      <CalendarTop
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onAddEvent={handleOpenAddModal}
        onImportSchedule={handleImportSchedule}
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

      {isModalOpen && selectedSlot && (
        <EventModal
          initialStart={selectedSlot.start}
          initialEnd={selectedSlot.end}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />
      )}

      {isAssignmentModalOpen && (
        <AssignmentModal
          onClose={() => setIsAssignmentModalOpen(false)}
          onSchedule={handleScheduleAssignment}
        />
      )}
    </div>

    <button
      type="button"
      onClick={() => setIsAssignmentModalOpen(true)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-(--accent-color) text-white rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all font-semibold text-sm select-none"
    >
      <GraduationCap className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline">Add Assignment</span>
    </button>
    </div>
  );
}