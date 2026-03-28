'use client';

import { useState } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfToday } from 'date-fns';
import { CalendarTop } from './CalendarTop';
import { MonthView } from './month view/MonthView';
import { CalendarEvent } from './month view/Day';
import { WeekView } from './week view/WeekView';
import { DayView } from './day view/DayView';

export function Calendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(startOfToday());
  
  const [events] = useState<CalendarEvent[]>([
    { 
      id: '1', 
      title: 'Chemistry Study', 
      start: new Date(2026, 2, 26, 8, 0),
      end: new Date(2026, 2, 26, 10, 30),
      color: 'bg-(--accent-color) border-none' 
    },
    { 
      id: '2', 
      title: 'Final Project Hackathon', 
      start: new Date(2026, 2, 26, 12, 30),
      end: new Date(2026, 2, 26, 15, 30),
      color: 'bg-emerald-500 border-none' 
    },
    { 
      id: '3', 
      title: 'Final Project Hackathon', 
      start: new Date(2026, 2, 26, 18, 30),
      end: new Date(2026, 2, 26, 23, 59),
      color: 'bg-(--accent-color) border-none' 
    },
  ]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const actions: Record<string, (date: Date, amount: number) => Date> = {
      month: direction === 'next' ? addMonths : subMonths,
      week: direction === 'next' ? addWeeks : subWeeks,
      day: direction === 'next' ? addDays : subDays,
    };
    setCurrentDate(actions[view](currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    console.log("Opening event creator for:", date);
  };

  return (
    <div 
      className="flex flex-col h-full w-full max-w-4xl border border-(--primary-text) rounded-xl overflow-hidden bg-background shadow-sm"
    >
      <CalendarTop 
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onToday={() => setCurrentDate(startOfToday())}
        onAddEvent={() => console.log("Open Gemini AI Assistant")}
      />
      
      <div className="flex-1 min-h-0">
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            events={events} 
            onDateClick={handleDateClick} 
          />
        )}
        
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            events={events} 
          />
        )}
        
        {view === 'day' && (
          <DayView 
            currentDate={currentDate} 
            events={events} 
          />
        )}
      </div>
    </div>
  );
}