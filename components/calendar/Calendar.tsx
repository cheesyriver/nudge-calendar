'use client';

import React, { useState } from 'react';
import { 
  addMonths, subMonths, addWeeks, subWeeks, 
  addDays, subDays, startOfToday,
} from 'date-fns';
import { CalendarTop } from './CalendarTop';
import { MonthView } from './MonthView';

export function Calendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(startOfToday());

  const handleNavigate = (direction: 'prev' | 'next') => {
    const actions: Record<string, Function> = {
      month: direction === 'next' ? addMonths : subMonths,
      week: direction === 'next' ? addWeeks : subWeeks,
      day: direction === 'next' ? addDays : subDays,
    };
    setCurrentDate(actions[view](currentDate, 1));
  };

  return (
    <div className="flex flex-col h-full w-4xl border rounded-xl overflow-hidden m">
      <CalendarTop 
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onToday={() => setCurrentDate(startOfToday())}
        onAddEvent={() => {}}
      />
      
      <div className="flex-1 overflow-y-auto">
        {view === 'month' && <MonthView currentDate={currentDate} />}
        {view !== 'month' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {view.charAt(0).toUpperCase() + view.slice(1)} view coming soon...
          </div>
        )}
      </div>
    </div>
  );
}