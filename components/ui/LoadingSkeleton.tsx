export function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}
