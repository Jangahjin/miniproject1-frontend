export function EmptyState({ message }: { message: string }) {
  return (
    <p role="status" className="py-12 text-center text-sm text-gray-500">
      {message}
    </p>
  );
}
