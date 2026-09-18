import { Loader2 } from "lucide-react";

export default function LoadingState({
  message = "Loading...",
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-8" : "min-h-[220px] py-12"
      }`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
        <Loader2
          size={22}
          className="animate-spin text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {message}
      </p>

      {!compact && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Just a moment...
        </p>
      )}
    </div>
  );
}