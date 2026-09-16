"use client";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        다시 시도
      </button>
    </div>
  );
}
