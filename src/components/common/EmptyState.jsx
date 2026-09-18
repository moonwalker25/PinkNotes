import { FileQuestion } from "lucide-react";

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = "Nothing here yet",
  description = "There isn't anything to show right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <Icon
          size={23}
          className="text-slate-500 dark:text-slate-400"
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}