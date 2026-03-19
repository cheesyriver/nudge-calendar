'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CalendarHeaderProps {
  currentDate: Date;
  view: string;
  onViewChange: (view: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
}

export function CalendarTop({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAddEvent
}: Readonly<CalendarHeaderProps>) {
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
          <Button variant="ghost" className="text-sm px-3 border-x rounded-none" onClick={onToday}>
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
          <SelectContent position="popper" className='bg-(--base-color)'>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>
    </div>
  );
}