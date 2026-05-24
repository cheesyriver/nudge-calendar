"use client";

import { useState } from "react";

const formatToDateTimeLocal = (date: Date | string) => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface EventModalProps {
  initialStart: Date;
  initialEnd: Date;
  onClose: () => void;
  onSave: (title: string, start: Date, end: Date) => void;
}

export function EventModal({
  initialStart,
  initialEnd,
  onClose,
  onSave,
}: Readonly<EventModalProps>) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(formatToDateTimeLocal(initialStart));
  const [end, setEnd] = useState(formatToDateTimeLocal(initialEnd));

  const isEndBeforeStart = Boolean(
    start && end && new Date(end) <= new Date(start),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isEndBeforeStart) return;
    onSave(title, new Date(start), new Date(end));
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      {/* Clickable backdrop for closing */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <div className="bg-background animate-in fade-in zoom-in relative w-full max-w-md rounded-2xl border border-(--primary-text) p-6 shadow-2xl duration-150">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="event-title"
              className="text-muted-foreground ml-1 text-[10px] font-bold tracking-wider uppercase"
            >
              Event Title
            </label>
            <input
              id="event-title"
              autoFocus
              required
              className="w-full rounded-xl border border-transparent bg-(--opaque-color) p-3 text-(--primary-text) transition-all outline-none focus:border-(--accent-color)"
              placeholder="e.g. Chemistry Revision"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date/Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="start-time"
                className="text-muted-foreground ml-1 text-[10px] font-bold tracking-wider uppercase"
              >
                Start Time
              </label>
              <input
                id="start-time"
                type="datetime-local"
                required
                className="w-full cursor-pointer rounded-lg border-none bg-(--opaque-color) p-2 text-sm text-(--primary-text)"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="end-time"
                className="text-muted-foreground ml-1 text-[10px] font-bold tracking-wider uppercase"
              >
                End Time
              </label>
              <input
                id="end-time"
                type="datetime-local"
                required
                className="w-full cursor-pointer rounded-lg border-none bg-(--opaque-color) p-2 text-sm text-(--primary-text)"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          {/* End-before-start validation message */}
          {isEndBeforeStart && (
            <p className="-mt-2 text-xs font-medium text-red-500">
              End time must be after start time.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-(--secondary-text) transition-colors hover:bg-(--opaque-color)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isEndBeforeStart}
              className="rounded-xl bg-(--accent-color) px-6 py-2 text-sm font-bold text-white shadow-(--accent-color)/20 shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
