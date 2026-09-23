"use client";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-none border-2 border-gray-950 bg-gray-950 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-gray-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
      >
        다시 시도
      </button>
    </div>
  );
}
