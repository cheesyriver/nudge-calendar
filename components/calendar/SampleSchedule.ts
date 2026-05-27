import { addDays, addWeeks } from 'date-fns';
import { CalendarEvent } from './types';

// Colour palette for different event categories
const CLASS_COLOR   = 'bg-(--accent-color) border-none text-white';
const WORK_COLOR    = 'bg-amber-500 border-none text-white';
const SOCIAL_COLOR  = 'bg-emerald-500 border-none text-white';
const STUDY_COLOR   = 'bg-violet-500 border-none text-white';
const FITNESS_COLOR = 'bg-rose-500 border-none text-white';

let _id = 0;
const uid = () => `sample-${++_id}`;

function makeEvent(
  title: string,
  base: Date,
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
  color: string,
): CalendarEvent {
  const start = new Date(base);
  start.setHours(startHour, startMin, 0, 0);
  const end = new Date(base);
  end.setHours(endHour, endMin, 0, 0);
  return { id: uid(), title, start, end, color };
}

function eventsForWeek(monday: Date, week: number): CalendarEvent[] {
  const tue = addDays(monday, 1);
  const wed = addDays(monday, 2);
  const thu = addDays(monday, 3);
  const fri = addDays(monday, 4);
  const sat = addDays(monday, 5);
  const sun = addDays(monday, 6);

  return [
    // Monday
    makeEvent('Gym Session',          monday,  6,  0,  7, 30, FITNESS_COLOR),
    makeEvent('Psychology Lecture',   monday,  9,  0, 10, 30, CLASS_COLOR),
    makeEvent('Statistics Tutorial',  monday, 14,  0, 15,  0, CLASS_COLOR),
    // Tuesday
    makeEvent('Chemistry Lecture',    tue,    10,  0, 11, 30, CLASS_COLOR),
    makeEvent('Chemistry Lab',        tue,    13,  0, 16,  0, CLASS_COLOR),
    makeEvent('Film Society Meeting', tue,    18,  0, 19, 30, SOCIAL_COLOR),
    // Wednesday
    makeEvent('Psychology Lecture',   wed,     9,  0, 10, 30, CLASS_COLOR),
    makeEvent('Mathematics Lecture',  wed,    11,  0, 12, 30, CLASS_COLOR),
    makeEvent('Cafe Shift',           wed,    17,  0, 21,  0, WORK_COLOR),
    // Thursday
    makeEvent('Gym Session',          thu,     6,  0,  7, 30, FITNESS_COLOR),
    makeEvent('Chemistry Lecture',    thu,    10,  0, 11, 30, CLASS_COLOR),
    makeEvent('Statistics Lecture',   thu,    15,  0, 16, 30, CLASS_COLOR),
    makeEvent('Study Group',          thu,    19,  0, 21,  0, STUDY_COLOR),
    // Friday
    makeEvent('Mathematics Tutorial', fri,    10,  0, 11,  0, CLASS_COLOR),
    makeEvent('Lunch with Friends',   fri,    12,  0, 14,  0, SOCIAL_COLOR),
    // Saturday — movie night on even weeks
    makeEvent('Cafe Shift', sat,    10,  0, 15,  0, WORK_COLOR),
    ...(week % 2 === 0 ? [makeEvent('Movie Night', sat, 19, 0, 22, 0, SOCIAL_COLOR)] : []),
    // Sunday — extra cafe shift on odd weeks
    ...(week % 2 === 1 ? [makeEvent('Cafe Shift', sun, 11, 0, 16, 0, WORK_COLOR)]  : []),
  ];
}

/**
 * Generates a realistic 4-week uni student schedule for June 2026.
 * Includes lectures, labs, part-time cafe shifts, gym sessions, and social events.
 */
export function generateSampleSchedule(): CalendarEvent[] {
  _id = 0; // reset so IDs are stable on repeated calls

  // June 1 2026 is a Monday — anchor the schedule to the start of the month
  const monday0 = new Date(2026, 5, 1);

  return Array.from({ length: 4 }, (_, week) =>
    eventsForWeek(addWeeks(monday0, week), week),
  ).flat();
}