'use client';

import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ViewType } from './types';

interface CalendarTopProps {
  currentDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  onImportSchedule: () => void;
}

export function CalendarTop({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
  onImportSchedule,
}: Readonly<CalendarTopProps>) {
  return (
    <div className="flex flex-wrap items-center sm:justify-between gap-y-2 gap-x-3 px-2 sm:px-6 py-2 sm:py-4 border-b bg-background">
      <div className="flex items-center gap-2 sm:gap-4">
        <h1 className="text-xs sm:text-xl font-semibold min-w-0 select-none">
          {format(currentDate, 'MMM yyyy')}
        </h1>
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" className="h-7 w-6 sm:h-9 sm:w-9" onClick={onPrev}>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-xs sm:text-sm px-1 sm:px-3 h-7 sm:h-9 border-x rounded-none"
            onClick={onToday}
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-6 sm:h-9 sm:w-9" onClick={onNext}>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-14 sm:w-30 h-7 sm:h-9 text-xs sm:text-sm">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-(--base-color)">
            <SelectItem value="day"><span className="sm:hidden">D</span><span className="hidden sm:inline">Day</span></SelectItem>
            <SelectItem value="week"><span className="sm:hidden">W</span><span className="hidden sm:inline">Week</span></SelectItem>
            <SelectItem value="month"><span className="sm:hidden">M</span><span className="hidden sm:inline">Month</span></SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onImportSchedule} className="gap-1 h-7 sm:h-9 px-2 sm:px-4">
          <BookOpen className="h-2 w-2 sm:h-4 sm:w-4 shrink-0" />
          <span className="hidden sm:inline">Import Schedule</span>
        </Button>

        <Button onClick={onAddEvent} className="gap-1 h-7 sm:h-9 px-1 sm:px-4">
          <Plus className="h-2 w-2 sm:h-4 sm:w-4 shrink-0" />
          <span className="hidden sm:inline">Add Event</span>
        </Button>
      </div>
    </div>
  );
}