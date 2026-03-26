'use client';

import { useState } from 'react';
import { 
  addMonths, subMonths, addWeeks, subWeeks, 
  addDays, subDays, startOfToday,
} from 'date-fns';
import { CalendarTop } from './CalendarTop';
import { MonthView } from './month view/MonthView';
import { CalendarEvent } from './month view/Day';
import { WeekView } from './week view/WeekView';

export function Calendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(startOfToday());
  
  // Placeholder for events state. REPLACE WITH FIREBASE DATA LATER!
  const [events] = useState<CalendarEvent[]>([
    { 
      id: '1', 
      title: 'Chemistry Study', 
      start: new Date(), 
      color: 'bg-emerald-100 border-emerald-200 text-emerald-800' 
    },
  ]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const actions: Record<string, Function> = {
      month: direction === 'next' ? addMonths : subMonths,
      week: direction === 'next' ? addWeeks : subWeeks,
      day: direction === 'next' ? addDays : subDays,
    };
    setCurrentDate(actions[view](currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    console.log("Opening event creator for:", date);
    // Trigger your Gemini Dialog or Add Event Modal
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl border rounded-xl overflow-hidden bg-background shadow-sm">
      <CalendarTop 
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onToday={() => setCurrentDate(startOfToday())}
        onAddEvent={() => console.log("Open Gemini AI Assistant")}
      />
      
      <div className="flex-1 overflow-y-auto">
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            events={events} 
            onDateClick={handleDateClick} 
          />
        )}
        
        {view === 'week' && (
          <WeekView currentDate={currentDate} events={events} />
        )}
      </div>
    </div>
  );
}