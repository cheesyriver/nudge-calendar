import { CalendarClockIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
export function Header() {
  return (
    <header className="mx-auto flex h-22 w-full max-w-7xl items-center">
      <div className="my-3 flex h-14 w-full items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full">
            <CalendarClockIcon className="size-10 text-t-secondary" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold leading-6 select-none">Nudge</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}