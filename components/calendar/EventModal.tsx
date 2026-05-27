'use client';

import { useState } from 'react';

// Accepts a Date object or an ISO string (e.g. after JSON.parse from localStorage)
const formatToDateTimeLocal = (date: Date | string) => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface EventModalProps {
  initialStart: Date | string;
  initialEnd: Date | string;
  onClose: () => void;
  onSave: (title: string, start: Date, end: Date) => void;
}

export function EventModal({
  initialStart,
  initialEnd,
  onClose,
  onSave,
}: Readonly<EventModalProps>) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(formatToDateTimeLocal(initialStart));
  const [end, setEnd] = useState(formatToDateTimeLocal(initialEnd));

  // Derived validation state — no extra useState needed
  const isEndBeforeStart = Boolean(start && end && new Date(end) <= new Date(start));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || isEndBeforeStart) return;
    onSave(title, new Date(start), new Date(end));
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      {/* Clickable backdrop for closing */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-background border border-(--primary-text) rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-150">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="event-title"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
            >
              Event Title
            </label>
            <input
              id="event-title"
              autoFocus
              required
              className="w-full p-3 bg-(--opaque-color) rounded-xl border border-transparent focus:border-(--accent-color) outline-none transition-all text-(--primary-text)"
              placeholder="e.g. Chemistry Revision"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date/Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="start-time"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                Start Time
              </label>
              <input
                id="start-time"
                type="datetime-local"
                required
                className="w-full p-2 bg-(--opaque-color) rounded-lg border-none text-sm text-(--primary-text) cursor-pointer"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="end-time"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                End Time
              </label>
              <input
                id="end-time"
                type="datetime-local"
                required
                className="w-full p-2 bg-(--opaque-color) rounded-lg border-none text-sm text-(--primary-text) cursor-pointer"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          {/* End-before-start validation message */}
          {isEndBeforeStart && (
            <p className="text-xs text-red-500 font-medium -mt-2">
              End time must be after start time.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold hover:bg-(--opaque-color) rounded-xl transition-colors text-(--secondary-text)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isEndBeforeStart}
              className="px-6 py-2 bg-(--accent-color) text-white text-sm font-bold rounded-xl shadow-lg shadow-(--accent-color)/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}