'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AssignmentDetails {
  title: string;
  type: 'assignment' | 'exam';
  dueDate: string;
  confidence: number;
  weightage: number;
  notes: string;
}

interface AssignmentModalProps {
  onClose: () => void;
  onSchedule: (details: AssignmentDetails) => Promise<void>;
}

const CONFIDENCE_LABEL: Record<number, string> = {
  1: 'No idea 😰', 2: 'Very lost 😟', 3: 'Struggling 😣',
  4: 'A little shaky 😕', 5: 'Somewhat okay 😐',
  6: 'Getting there 🙂', 7: 'Pretty confident 😊',
  8: 'Solid 💪', 9: 'Very confident 😎', 10: 'Got this 🎯',
};

export function AssignmentModal({ onClose, onSchedule }: Readonly<AssignmentModalProps>) {
  const [title, setTitle]         = useState('');
  const [type, setType]           = useState<'assignment' | 'exam'>('assignment');
  const [dueDate, setDueDate]     = useState('');
  const [confidence, setConfidence] = useState(5);
  const [weightage, setWeightage] = useState(20);
  const [notes, setNotes]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onSchedule({ title, type, dueDate, confidence, weightage, notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a schedule. Check your API key and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        disabled={isLoading}
      />

      <div className="relative w-full max-w-lg bg-background border border-(--primary-text) rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm rounded-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-(--accent-color)" />
            <div className="text-center">
              <p className="font-bold text-(--primary-text)">AI is building your schedule…</p>
              <p className="text-sm text-muted-foreground mt-1">Finding free slots around your existing events</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-lg font-bold text-(--primary-text)">Add Assignment / Exam</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI will schedule study sessions around your existing calendar.
            </p>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="a-title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Title
            </label>
            <input
              id="a-title"
              autoFocus
              required
              placeholder="e.g. Chemistry Final Exam"
              className="w-full p-3 bg-(--opaque-color) rounded-xl border border-transparent focus:border-(--accent-color) outline-none transition-all text-(--primary-text)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Type toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Type</span>
            <div className="flex rounded-xl overflow-hidden border border-(--primary-text)/20 w-fit">
              {(['assignment', 'exam'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'px-5 py-2 text-sm font-semibold capitalize transition-colors',
                    type === t
                      ? 'bg-(--accent-color) text-white'
                      : 'bg-(--opaque-color) text-(--secondary-text) hover:bg-(--opaque-color)/80',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Due date + Weightage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="a-due" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Due Date
              </label>
              <input
                id="a-due"
                type="date"
                required
                className="w-full p-2 bg-(--opaque-color) rounded-lg border-none text-sm text-(--primary-text) cursor-pointer"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="a-weight" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Weightage (%)
              </label>
              <input
                id="a-weight"
                type="number"
                min={1}
                max={100}
                required
                className="w-full p-2 bg-(--opaque-color) rounded-lg border-none text-sm text-(--primary-text)"
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Confidence slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Confidence Level
              </span>
              <span className="text-xs font-semibold text-(--primary-text)">
                {confidence}/10 - {CONFIDENCE_LABEL[confidence]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-(--accent-color) cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              <span>Not confident</span>
              <span>Got this</span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="a-notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="a-notes"
              rows={2}
              placeholder="e.g. Covers chapters 4–7, need to practise past papers"
              className="w-full p-3 bg-(--opaque-color) rounded-xl border border-transparent focus:border-(--accent-color) outline-none transition-all text-(--primary-text) text-sm resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold hover:bg-(--opaque-color) rounded-xl transition-colors text-(--secondary-text) disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !dueDate || isLoading}
              className="px-6 py-2 bg-(--accent-color) text-white text-sm font-bold rounded-xl shadow-lg shadow-(--accent-color)/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule with AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}