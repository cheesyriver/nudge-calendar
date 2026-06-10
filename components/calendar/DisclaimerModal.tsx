'use client';

import { useState } from 'react';

export function DisclaimerModal() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md bg-background border border-(--primary-text) rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-150">
        <h2 className="text-lg font-bold text-(--primary-text) mb-2">⚠️ Prototype Notice</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is an early prototype of Project Nudge. The AI study scheduler is functional but may occasionally produce scheduling errors, such as overlapping sessions or unexpected time slots.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          We are actively working on improving accuracy. Happy testing!
        </p>
        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-2 bg-(--accent-color) text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}