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

// Interface name now matches the component name
interface CalendarTopProps {
  currentDate: Date;
  view: ViewType; // Was `string` — now type-safe
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
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold min-w-50 select-none">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-sm px-3 border-x rounded-none"
            onClick={onToday}
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-30">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-(--base-color)">
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onImportSchedule} className="gap-2">
          <BookOpen className="h-4 w-4" />
          Import Schedule
        </Button>

        <Button onClick={onAddEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>
    </div>
  );
}