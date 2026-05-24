export type ViewType = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}